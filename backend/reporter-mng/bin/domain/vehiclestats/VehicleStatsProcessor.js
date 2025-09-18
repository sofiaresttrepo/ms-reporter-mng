"use strict";

const { Subject, of, from } = require("rxjs");
const { 
  bufferTime, 
  filter, 
  mergeMap, 
  map, 
  catchError, 
  tap,
  switchMap,
  concatMap
} = require('rxjs/operators');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { brokerFactory } = require("@nebulae/backend-node-tools").broker;

const { VehicleStatsDA } = require("./data-access");

const broker = brokerFactory();
const MATERIALIZED_VIEW_TOPIC = "emi-gateway-materialized-view-updates";

/**
 * Singleton instance
 * @type { VehicleStatsProcessor }
 */
let instance;

class VehicleStatsProcessor {
    constructor() {
        /**
         * Subject para recibir eventos MQTT de vehículos generados
         * CRITICAL: Este Subject recibe eventos del tópico 'fleet/vehicles/generated'
         * y los procesa en lotes usando bufferTime(1000)
         */
        this.vehicleEventsSubject$ = new Subject();
        
        /**
         * Configurar el flujo de procesamiento por lotes con idempotencia
         * FLOW: vehicleEventsSubject$ -> bufferTime(1000) -> filter -> idempotencia -> update MongoDB
         */
        this.setupBatchProcessingFlow();
        
        /**
         * Suscribirse al tópico MQTT para recibir eventos VehicleGenerated
         * Los eventos se alimentan al Subject para procesamiento
         */
        this.setupMQTTSubscription();
        
        ConsoleLogger.i('VehicleStatsProcessor: Initialized with batch processing (1000ms buffer)');
    }

    /**
     * Configurar el flujo de procesamiento por lotes
     * CRITICAL PATTERN: bufferTime(1000) + filter + idempotencia + MongoDB update
     */
    setupBatchProcessingFlow() {
        this.vehicleEventsSubject$.pipe(
            /**
             * bufferTime(1000): Agrupa eventos por 1 segundo
             * Crea arrays de eventos recibidos en ventanas de 1 segundo
             * [event1, event2, event3...] cada 1000ms
             */
            bufferTime(1000),
            
            /**
             * filter: Solo procesar si el buffer no está vacío
             * Evita procesamiento innecesario cuando no hay eventos
             */
            filter(buffer => buffer.length > 0),
            
            /**
             * concatMap: Procesar lotes secuencialmente (importante para MongoDB)
             * Garantiza que los lotes se procesen en orden y no en paralelo
             * para evitar condiciones de carrera en las actualizaciones de estadísticas
             */
            concatMap(eventBatch => this.processEventBatch$(eventBatch)),
            
            /**
             * Logging para debugging y monitoreo
             */
            tap(result => ConsoleLogger.d(`VehicleStatsProcessor: Processed batch of ${result.processedCount} vehicles`)),
            
            /**
             * Error handling global del flujo
             */
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsProcessor: Error in batch processing flow`, error);
                return of(null); // Continuar el flujo después del error
            })
        ).subscribe({
            next: (result) => {
                if (result) {
                    // Enviar estadísticas actualizadas al frontend vía WebSocket
                    this.sendStatsToFrontend(result.stats);
                }
            },
            error: (error) => {
                ConsoleLogger.e(`VehicleStatsProcessor: Fatal error in subscription`, error);
            }
        });
    }

    /**
     * Procesar un lote de eventos con lógica de idempotencia
     * @param {Array} eventBatch - Array de eventos VehicleGenerated
     * @returns {Observable} - Observable con el resultado del procesamiento
     */
    processEventBatch$(eventBatch) {
        ConsoleLogger.i(`VehicleStatsProcessor: Processing batch of ${eventBatch.length} events`);
        
        return of(eventBatch).pipe(
            /**
             * STEP 1: Extraer AIDs únicos del lote para verificar idempotencia
             */
            map(batch => ({
                batch,
                aids: batch.map(event => event.data?.aid).filter(aid => aid) // Filtrar AIDs válidos
            })),
            
            /**
             * STEP 2: Verificar cuáles AIDs ya han sido procesados (idempotencia)
             */
            mergeMap(({ batch, aids }) => 
                VehicleStatsDA.getProcessedVehicleIds$(aids).pipe(
                    map(processedAids => ({
                        batch,
                        aids,
                        processedAids: new Set(processedAids), // Set para búsqueda O(1)
                        newAids: aids.filter(aid => !processedAids.includes(aid))
                    }))
                )
            ),
            
            /**
             * STEP 3: Filtrar eventos ya procesados (aplicar idempotencia)
             */
            map(({ batch, aids, processedAids, newAids }) => {
                const newVehicles = batch
                    .filter(event => event.data?.aid && !processedAids.has(event.data.aid))
                    .map(event => event.data);
                
                ConsoleLogger.d(`VehicleStatsProcessor: ${batch.length} events, ${processedAids.size} already processed, ${newVehicles.length} new vehicles`);
                
                return {
                    allVehicles: batch.map(event => event.data),
                    newVehicles,
                    newAids
                };
            }),
            
            /**
             * STEP 4: Si no hay vehículos nuevos, salir temprano
             */
            filter(({ newVehicles }) => newVehicles.length > 0),
            
            /**
             * STEP 5: Actualizar estadísticas en MongoDB UNA SOLA VEZ por lote
             */
            mergeMap(({ newVehicles, newAids }) => 
                this.updateFleetStatistics$(newVehicles).pipe(
                    /**
                     * STEP 6: Marcar AIDs como procesados en la colección de idempotencia
                     */
                    mergeMap(stats => 
                        VehicleStatsDA.markVehiclesAsProcessed$(newAids).pipe(
                            map(() => ({
                                stats,
                                processedCount: newVehicles.length,
                                newAids
                            }))
                        )
                    )
                )
            ),
            
            /**
             * Error handling específico del lote
             */
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsProcessor: Error processing batch`, error);
                return of({
                    stats: null,
                    processedCount: 0,
                    error: error.message
                });
            })
        );
    }

    /**
     * Actualizar estadísticas de la flota en MongoDB usando operadores de agregación
     * PATTERN: findOneAndUpdate con upsert y operadores $inc para agregaciones atómicas
     */
    updateFleetStatistics$(newVehicles) {
        ConsoleLogger.d(`VehicleStatsProcessor: Updating fleet statistics with ${newVehicles.length} new vehicles`);
        
        /**
         * Calcular agregaciones del lote actual
         */
        const batchStats = this.calculateBatchStatistics(newVehicles);
        
        /**
         * Preparar el documento de actualización usando operadores MongoDB
         * $inc: incrementa valores numéricos
         * $set: establece valores escalares
         */
        const updateDoc = {
            $inc: {
                // Contadores totales
                'totalVehicles': batchStats.totalVehicles,
                'totalHorsepower': batchStats.totalHorsepower,
                
                // Contadores por tipo de vehículo
                ...Object.entries(batchStats.typeCount).reduce((acc, [type, count]) => {
                    acc[`typeCount.${type}`] = count;
                    return acc;
                }, {}),
                
                // Contadores por fuente de energía
                ...Object.entries(batchStats.powerSourceCount).reduce((acc, [source, count]) => {
                    acc[`powerSourceCount.${source}`] = count;
                    return acc;
                }, {}),
                
                // Contadores por década
                ...Object.entries(batchStats.decadeCount).reduce((acc, [decade, count]) => {
                    acc[`decadeCount.${decade}`] = count;
                    return acc;
                }, {})
            },
            $set: {
                'lastUpdated': new Date(),
                'lastBatchSize': batchStats.totalVehicles
            }
        };
        
        /**
         * Ejecutar actualización atómica en MongoDB
         * upsert: true crea el documento si no existe
         * returnOriginal: false devuelve el documento actualizado
         */
        return VehicleStatsDA.updateFleetStatistics$(updateDoc).pipe(
            /**
             * Recalcular promedios después de la actualización
             * (MongoDB no soporta cálculo de promedios en $inc)
             */
            mergeMap(updatedStats => this.recalculateAverages$(updatedStats)),
            
            tap(finalStats => ConsoleLogger.d(`VehicleStatsProcessor: Fleet statistics updated - Total: ${finalStats.totalVehicles}, Avg HP: ${finalStats.averageHorsepower}`))
        );
    }

    /**
     * Calcular estadísticas agregadas del lote actual
     * @param {Array} vehicles - Array de vehículos nuevos
     * @returns {Object} - Objeto con estadísticas agregadas
     */
    calculateBatchStatistics(vehicles) {
        const stats = {
            totalVehicles: vehicles.length,
            totalHorsepower: 0,
            typeCount: {},
            powerSourceCount: {},
            decadeCount: {}
        };

        vehicles.forEach(vehicle => {
            // Sumar caballos de fuerza
            stats.totalHorsepower += vehicle.hp || 0;
            
            // Contar por tipo
            const type = vehicle.type || 'unknown';
            stats.typeCount[type] = (stats.typeCount[type] || 0) + 1;
            
            // Contar por fuente de energía
            const powerSource = vehicle.powerSource || 'unknown';
            stats.powerSourceCount[powerSource] = (stats.powerSourceCount[powerSource] || 0) + 1;
            
            // Contar por década
            const year = vehicle.year || new Date().getFullYear();
            const decade = Math.floor(year / 10) * 10;
            const decadeKey = `${decade}s`;
            stats.decadeCount[decadeKey] = (stats.decadeCount[decadeKey] || 0) + 1;
        });

        return stats;
    }

    /**
     * Recalcular promedios después de actualización incremental
     * Necesario porque MongoDB $inc no puede calcular promedios directamente
     */
    recalculateAverages$(stats) {
        if (!stats || stats.totalVehicles === 0) {
            return of(stats);
        }

        const averageHorsepower = Math.round(stats.totalHorsepower / stats.totalVehicles);
        
        return VehicleStatsDA.updateAverages$({ averageHorsepower }).pipe(
            map(() => ({
                ...stats,
                averageHorsepower
            }))
        );
    }

    /**
     * Configurar suscripción al tópico MQTT fleet/vehicles/generated
     */
    setupMQTTSubscription() {
        try {
            // Suscribirse al tópico MQTT donde ms-generator publica eventos
            broker.getMessageListener$('fleet/vehicles/generated', 'VehicleGenerated').subscribe({
                next: (message) => {
                    try {
                        ConsoleLogger.d(`VehicleStatsProcessor: Received MQTT event from fleet/vehicles/generated`);
                        // Alimentar evento al Subject para procesamiento por lotes
                        this.vehicleEventsSubject$.next(message);
                    } catch (error) {
                        ConsoleLogger.e(`VehicleStatsProcessor: Error processing MQTT message`, error);
                    }
                },
                error: (error) => {
                    ConsoleLogger.e(`VehicleStatsProcessor: Error in MQTT subscription`, error);
                }
            });
            
            ConsoleLogger.i('VehicleStatsProcessor: MQTT subscription established for fleet/vehicles/generated');
        } catch (error) {
            ConsoleLogger.e(`VehicleStatsProcessor: Failed to setup MQTT subscription`, error);
        }
    }

    /**
     * Enviar estadísticas actualizadas al frontend vía WebSocket/MQTT
     * @param {Object} stats - Estadísticas de la flota actualizadas
     */
    async sendStatsToFrontend(stats) {
        try {
            if (!stats) return;
            
            const statsUpdate = {
                eventType: 'FleetStatisticsUpdated',
                eventTypeVersion: 1,
                aggregateType: 'FleetStats',
                aggregateId: 'fleet-statistics',
                data: stats,
                timestamp: Date.now()
            };

            // Enviar al tópico de actualizaciones de vistas materializadas
            await broker.send$(MATERIALIZED_VIEW_TOPIC, 'FleetStatisticsUpdated', statsUpdate).toPromise();
            
            ConsoleLogger.d(`VehicleStatsProcessor: Fleet statistics sent to frontend - Total vehicles: ${stats.totalVehicles}`);
        } catch (error) {
            ConsoleLogger.e(`VehicleStatsProcessor: Error sending stats to frontend`, error);
        }
    }

    /**
     * Obtener estadísticas actuales de la flota
     * @returns {Observable} - Observable con las estadísticas actuales
     */
    getCurrentFleetStatistics$() {
        return VehicleStatsDA.getFleetStatistics$().pipe(
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsProcessor: Error getting current fleet statistics`, error);
                return of({
                    totalVehicles: 0,
                    averageHorsepower: 0,
                    typeCount: {},
                    powerSourceCount: {},
                    decadeCount: {},
                    lastUpdated: new Date()
                });
            })
        );
    }
}

/**
 * @returns {VehicleStatsProcessor}
 */
module.exports = () => {
    if (!instance) {
        instance = new VehicleStatsProcessor();
        ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};

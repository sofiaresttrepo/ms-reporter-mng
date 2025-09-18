"use strict";

const { of, defer, Observable } = require("rxjs");
const { map, mergeMap, catchError, tap } = require("rxjs/operators");
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

let mongoDB = undefined;

/**
 * Singleton instance
 * @type { VehicleStatsDA }
 */
let instance;

class VehicleStatsDA {
    // Nombres de colecciones como constantes estáticas
    static FLEET_STATS_COLLECTION = 'fleet_statistics';
    static PROCESSED_VEHICLES_COLLECTION = 'processed_vehicles';

    static start$(mongoDbInstance) {
        return Observable.create(observer => {
            if (mongoDbInstance) {
                mongoDB = mongoDbInstance;
                observer.next(`${this.name} using given mongo instance`);
            } else {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
                observer.next(`${this.name} using singleton system-wide mongo instance`);
            }
            observer.next(`${this.name} started`);
            observer.complete();
        });
    }

    constructor() {
        // Nombres de colecciones
        this.FLEET_STATS_COLLECTION = 'fleet_statistics';
        this.PROCESSED_VEHICLES_COLLECTION = 'processed_vehicles';
        
        ConsoleLogger.i('VehicleStatsDA: Initialized with MongoDB collections');
    }

    /**
     * Obtener AIDs de vehículos ya procesados para verificar idempotencia
     * @param {Array<string>} aids - Array de AIDs a verificar
     * @returns {Observable<Array<string>>} - Observable con AIDs ya procesados
     */
    static getProcessedVehicleIds$(aids) {
        return defer(() => {
            if (!aids || aids.length === 0) {
                return of([]);
            }
            
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                .find({ aid: { $in: aids } })
                .project({ aid: 1, _id: 0 })
                .toArray();
        }).pipe(
            map(docs => docs.map(doc => doc.aid)),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.getProcessedVehicleIds: Error`, error);
                return of([]); // En caso de error, asumir que ningún AID fue procesado
            })
        );
    }

    /**
     * Marcar vehículos como procesados en la colección de idempotencia
     * @param {Array<string>} aids - AIDs de vehículos a marcar como procesados
     * @returns {Observable} - Observable con el resultado de la inserción
     */
    static markVehiclesAsProcessed$(aids) {
        return defer(() => {
            if (!aids || aids.length === 0) {
                return of({ insertedCount: 0 });
            }
            
            // Preparar documentos para inserción
            const documents = aids.map(aid => ({
                aid,
                processedAt: new Date(),
                batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }));
            
            // Inserción con opción ordered: false para continuar aunque algunos fallen (duplicados)
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                .insertMany(documents, { ordered: false });
        }).pipe(
            map(result => ({
                insertedCount: result.insertedCount,
                aids: aids
            })),
            catchError(error => {
                // Los errores de duplicado (código 11000) son esperados en idempotencia
                if (error.code === 11000) {
                    ConsoleLogger.d(`VehicleStatsDA.markVehiclesAsProcessed: Some AIDs already processed (expected behavior)`);
                    return of({ 
                        insertedCount: error.result?.insertedCount || 0, 
                        aids: aids,
                        duplicatesHandled: true 
                    });
                }
                
                ConsoleLogger.e(`VehicleStatsDA.markVehiclesAsProcessed: Error`, error);
                throw error;
            })
        );
    }

    /**
     * Actualizar estadísticas de la flota usando operadores de agregación atómica
     * @param {Object} updateDoc - Documento de actualización con operadores MongoDB
     * @returns {Observable} - Observable con las estadísticas actualizadas
     */
    static updateFleetStatistics$(updateDoc) {
        return defer(() => {
            const filter = { _id: 'fleet-statistics' }; // Documento único para toda la flota
            
            const options = {
                upsert: true,           // Crear documento si no existe
                returnOriginal: false,   // Retornar documento actualizado
                projection: {           // Solo campos necesarios para reducir transferencia
                    totalVehicles: 1,
                    totalHorsepower: 1,
                    averageHorsepower: 1,
                    typeCount: 1,
                    powerSourceCount: 1,
                    decadeCount: 1,
                    lastUpdated: 1,
                    lastBatchSize: 1
                }
            };
            
            ConsoleLogger.d(`VehicleStatsDA.updateFleetStatistics: Executing atomic update with upsert`);
            
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.FLEET_STATS_COLLECTION)
                .findOneAndUpdate(filter, updateDoc, options);
        }).pipe(
            map(result => {
                const stats = result.value || result; // Manejar diferentes versiones de driver MongoDB
                
                if (!stats) {
                    throw new Error('Failed to update fleet statistics - no document returned');
                }
                
                ConsoleLogger.d(`VehicleStatsDA.updateFleetStatistics: Successfully updated fleet statistics`);
                return stats;
            }),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.updateFleetStatistics: Error updating statistics`, error);
                throw error;
            })
        );
    }

    /**
     * Actualizar promedios calculados en las estadísticas
     * @param {Object} averages - Objeto con promedios calculados
     * @returns {Observable} - Observable con el resultado de la actualización
     */
    static updateAverages$(averages) {
        return defer(() => {
            const filter = { _id: 'fleet-statistics' };
            const updateDoc = {
                $set: {
                    ...averages,
                    averagesUpdatedAt: new Date()
                }
            };
            
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.FLEET_STATS_COLLECTION)
                .updateOne(filter, updateDoc);
        }).pipe(
            map(result => ({
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                averages
            })),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.updateAverages: Error updating averages`, error);
                throw error;
            })
        );
    }

    /**
     * Obtener estadísticas actuales de la flota
     * @returns {Observable} - Observable con las estadísticas de la flota
     */
    static getFleetStatistics$() {
        return defer(() => {
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.FLEET_STATS_COLLECTION)
                .findOne({ _id: 'fleet-statistics' });
        }).pipe(
            map(stats => {
                if (!stats) {
                    // Retornar estadísticas iniciales si no existe el documento
                    return {
                        _id: 'fleet-statistics',
                        totalVehicles: 0,
                        totalHorsepower: 0,
                        averageHorsepower: 0,
                        typeCount: {},
                        powerSourceCount: {},
                        decadeCount: {},
                        lastUpdated: new Date(),
                        lastBatchSize: 0
                    };
                }
                return stats;
            }),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.getFleetStatistics: Error getting fleet statistics`, error);
                throw error;
            })
        );
    }

    /**
     * Crear índices necesarios para optimizar las consultas
     * Debe llamarse durante la inicialización del dominio
     * @returns {Observable} - Observable con el resultado de la creación de índices
     */
    static createIndexes$() {
        return defer(() => {
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            if (!mongoDB || !mongoDB.db) {
                ConsoleLogger.w(`VehicleStatsDA.createIndexes: MongoDB not initialized, skipping index creation`);
                return Promise.resolve({ indexesCreated: 0, error: 'MongoDB not initialized' });
            }
            
            const indexPromises = [
                // Índice único en AID para idempotencia
                mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                    .createIndex(
                        { aid: 1 }, 
                        { 
                            unique: true, 
                            name: 'aid_unique_idx',
                            background: true 
                        }
                    ),
                
                // Índice compuesto para consultas de cleanup por fecha
                mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                    .createIndex(
                        { processedAt: 1, batchId: 1 }, 
                        { 
                            name: 'processedAt_batchId_idx',
                            background: true 
                        }
                    ),
                
                // TTL index para cleanup automático de processed_vehicles (30 días)
                mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                    .createIndex(
                        { processedAt: 1 }, 
                        { 
                            expireAfterSeconds: 30 * 24 * 60 * 60, // 30 días
                            name: 'processedAt_ttl_idx',
                            background: true 
                        }
                    )
            ];
            
            return Promise.all(indexPromises);
        }).pipe(
            map(results => {
                ConsoleLogger.i(`VehicleStatsDA.createIndexes: Successfully created ${results.length} indexes`);
                return { indexesCreated: results.length };
            }),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.createIndexes: Error creating indexes`, error);
                // No fallar si los índices ya existen
                return of({ indexesCreated: 0, error: error.message });
            })
        );
    }

    /**
     * Limpiar registros antiguos de vehículos procesados (maintenance task)
     * @param {number} daysOld - Días de antigüedad para limpiar (default: 7)
     * @returns {Observable} - Observable con el resultado del cleanup
     */
    static cleanupOldProcessedVehicles$(daysOld = 7) {
        return defer(() => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            
            if (!mongoDB) {
                mongoDB = require("../../../tools/mongo-db/MongoDB").singleton();
            }
            return mongoDB.db.collection(VehicleStatsDA.PROCESSED_VEHICLES_COLLECTION)
                .deleteMany({ processedAt: { $lt: cutoffDate } });
        }).pipe(
            map(result => ({
                deletedCount: result.deletedCount,
                cutoffDate
            })),
            tap(result => 
                ConsoleLogger.i(`VehicleStatsDA.cleanupOldProcessedVehicles: Deleted ${result.deletedCount} old records`)
            ),
            catchError(error => {
                ConsoleLogger.e(`VehicleStatsDA.cleanupOldProcessedVehicles: Error during cleanup`, error);
                throw error;
            })
        );
    }
}

/**
 * @returns {VehicleStatsDA}
 */
module.exports = () => {
    if (!instance) {
        instance = new VehicleStatsDA();
        ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};

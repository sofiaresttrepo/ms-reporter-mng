"use strict";

const { of, throwError } = require("rxjs");
const { mergeMap, catchError, map } = require('rxjs/operators');

const { CqrsResponseHelper } = require('@nebulae/backend-node-tools').cqrs;
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { CustomError, INTERNAL_SERVER_ERROR_CODE } = require("@nebulae/backend-node-tools").error;

const VehicleStatsProcessor = require("./VehicleStatsProcessor");

const READ_ROLES = []; // Permitir acceso sin roles específicos por ahora
const REQUIRED_ATTRIBUTES = [];

/**
 * Singleton instance
 * @type { VehicleStatsCRUD }
 */
let instance;

class VehicleStatsCRUD {
  constructor() {
    this.statsProcessor = VehicleStatsProcessor();
  }

  /**     
   * Generates and returns an object that defines the CQRS request handlers.
   * 
   * The map is a relationship of: AGGREGATE_TYPE VS { MESSAGE_TYPE VS  { fn: rxjsFunction, instance: invoker_instance } }
   */
  generateRequestProcessorMap() {
    return {
      'VehicleStats': {
        "emigateway.graphql.query.GetFleetStatistics": { 
          fn: instance.getFleetStatistics$, 
          instance, 
          jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES } 
        }
      }
    }
  };

  /**
   * Obtener estadísticas actuales de la flota
   * Query GraphQL: getFleetStatistics
   */
  getFleetStatistics$({ args }, authToken) {
    try {
      ConsoleLogger.d(`VehicleStatsCRUD.getFleetStatistics: User ${authToken.preferred_username} requesting fleet statistics`);
      
      return this.statsProcessor.getCurrentFleetStatistics$().pipe(
        mergeMap(stats => CqrsResponseHelper.buildSuccessResponse$(stats)),
        catchError(err => {
          ConsoleLogger.e(`VehicleStatsCRUD.getFleetStatistics: Error`, err);
          return CqrsResponseHelper.handleError$(err);
        })
      );
    } catch (error) {
      ConsoleLogger.e(`VehicleStatsCRUD.getFleetStatistics: Unexpected error`, error);
      return throwError(new CustomError('FLEET_STATS_ERROR', 'Error getting fleet statistics', INTERNAL_SERVER_ERROR_CODE, error));
    }
  }
}

/**
 * @returns {VehicleStatsCRUD}
 */
module.exports = () => {
  if (!instance) {
    instance = new VehicleStatsCRUD();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};

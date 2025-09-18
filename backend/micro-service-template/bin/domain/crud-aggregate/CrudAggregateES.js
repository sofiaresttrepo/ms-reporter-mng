'use strict'

const { iif } = require("rxjs");
const { tap } = require('rxjs/operators');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

const CrudAggregateDA = require("./data-access/CrudAggregateDA");
/**
 * Singleton instance
 * @type { CrudAggregateES }
 */
let instance;

class CrudAggregateES {

    constructor() {
    }

    /**     
     * Generates and returns an object that defines the Event-Sourcing events handlers.
     * 
     * The map is a relationship of: AGGREGATE_TYPE VS { EVENT_TYPE VS  { fn: rxjsFunction, instance: invoker_instance } }
     * 
     * ## Example
     *  { "User" : { "UserAdded" : {fn: handleUserAdded$, instance: classInstance } } }
     */
    generateEventProcessorMap() {
        return {
            'CrudAggregate': {
                "CrudAggregateModified": { fn: instance.handleCrudAggregateModified$, instance, processOnlyOnSync: true },
            }
        }
    };

    /**
     * Using the CrudAggregateModified events restores the MaterializedView
     * This is just a recovery strategy
     * @param {*} CrudAggregateModifiedEvent CrudAggregate Modified Event
     */
    handleCrudAggregateModified$({ etv, aid, av, data, user, timestamp }) {
        const aggregateDataMapper = [
            /*etv=0 mapper*/ () => { throw new Error('etv 0 is not an option') },
            /*etv=1 mapper*/ (eventData) => { return { ...eventData, modType: undefined }; }
        ];
        delete aggregateDataMapper.modType;
        const aggregateData = aggregateDataMapper[etv](data);
        return iif(
            () => (data.modType === 'DELETE'),
            CrudAggregateDA.deleteCrudAggregate$(aid),
            CrudAggregateDA.updateCrudAggregateFromRecovery$(aid, aggregateData, av)
        ).pipe(
            tap(() => ConsoleLogger.i(`CrudAggregateES.handleCrudAggregateModified: ${data.modType}: aid=${aid}, timestamp=${timestamp}`))
        )
    }
}


/**
 * @returns {CrudAggregateES}
 */
module.exports = () => {
    if (!instance) {
        instance = new CrudAggregateES();
        ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};
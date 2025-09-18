'use strict'

const { iif } = require("rxjs");
const { tap } = require('rxjs/operators');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

const ReportDA = require("./data-access/ReportDA");
/**
 * Singleton instance
 * @type { ReportES }
 */
let instance;

class ReportES {

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
            'Report': {
                "ReportModified": { fn: instance.handleReportModified$, instance, processOnlyOnSync: true },
            }
        }
    };

    /**
     * Using the ReportModified events restores the MaterializedView
     * This is just a recovery strategy
     * @param {*} ReportModifiedEvent Report Modified Event
     */
    handleReportModified$({ etv, aid, av, data, user, timestamp }) {
        const aggregateDataMapper = [
            /*etv=0 mapper*/ () => { throw new Error('etv 0 is not an option') },
            /*etv=1 mapper*/ (eventData) => { return { ...eventData, modType: undefined }; }
        ];
        delete aggregateDataMapper.modType;
        const aggregateData = aggregateDataMapper[etv](data);
        return iif(
            () => (data.modType === 'DELETE'),
            ReportDA.deleteReport$(aid),
            ReportDA.updateReportFromRecovery$(aid, aggregateData, av)
        ).pipe(
            tap(() => ConsoleLogger.i(`ReportES.handleReportModified: ${data.modType}: aid=${aid}, timestamp=${timestamp}`))
        )
    }
}


/**
 * @returns {ReportES}
 */
module.exports = () => {
    if (!instance) {
        instance = new ReportES();
        ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};
"use strict";

const { concat } = require("rxjs");

/**
 * services listing
 * Please add any new services to this list
 */
const services = {
    EventStoreService: require("./event-store-service"),
    CqrsService: require("./cqrs-service"),
};

module.exports = {
    /**
     * service layer start workflow
     * @returns {Observable}
     */
    start$: concat(
        ...Object.values(services)
            .filter(service => service.start$)
            .map(service => service.start$)
    ),

    /**
     * Service layer start workflow for syncing
     * @returns {Observable}
     */
    startForSyncing$: concat(
        ...Object.values(services)
            .filter(service => service.startForSyncing$)
            .map(service => service.startForSyncing$)
    ),

    /**
     * Service layer start workflow for getting ready
     * @returns {Observable}
     */
    startForGettingReady$: concat(
        ...Object.values(services)
            .filter(service => service.startForGettingReady$)
            .map(service => service.startForGettingReady$)
    ),

    /**
     * domain layer stop workflow
     * @returns {Observable}
     */
    stop$: concat(
        ...Object.values(services)
            .filter(service => service.stop$)
            .map(service => service.stop$)
    ),

    ...services
};

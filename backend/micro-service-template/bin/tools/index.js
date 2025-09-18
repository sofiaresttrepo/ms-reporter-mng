"use strict";

const { concat, Observable } = require("rxjs");

/**
 * tools listing
 * Please add any new tools to this list
 */
const tools = {
    MongoDB: require("./mongo-db"),
    EventSourcing: require("./event-sourcing"),
};

module.exports = {
    /**
     * tools start workflow
     * @returns {Observable}
     */
    start$: concat(
        ...Object.values(tools)
            .filter(tool => tool.start$)
            .map(tool => tool.start$)
    ),

    /**
     * tools start workflow for syncing
     * @returns {Observable}
     */
    startForSyncing$: concat(
        ...Object.values(tools)
            .filter(tool => tool.startForSyncing$)
            .map(tool => tool.startForSyncing$)
    ),

    /**
     * tools start workflow for getting ready
     * @returns {Observable}
     */
    startForGettingReady$: concat(
        ...Object.values(tools)
            .filter(tool => tool.startForGettingReady$)
            .map(tool => tool.startForGettingReady$)
    ),

    /**
     * tools layer stop workflow
     * @returns {Observable}
     */
    stop$: concat(
        ...Object.values(tools)
            .filter(tool => tool.stop$)
            .map(tool => tool.stop$)
    ),

    ...tools
};

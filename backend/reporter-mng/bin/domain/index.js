"use strict"

const { concat } = require("rxjs");

/**
 * Domain listing
 * Please add any new domain to this list
 */
const domains = {
  report: require("./report")
};

module.exports = {
  /**
   * domain layer start workflow
   * @returns {Observable}
   */
  start$: concat(
    ...Object.values(domains)
      .filter(domain => domain.start$)
      .map(domain => domain.start$)
  ),

  /**
   * domain layer start workflow for syncing
   * @returns {Observable}
   */
  startForSyncing$: concat(
    ...Object.values(domains)
      .filter(domain => domain.startForSyncing$)
      .map(domain => domain.startForSyncing$)
  ),

  /**
   * domain layer start workflow for getting ready
   * @returns {Observable}
   */
  startForGettingReady$: concat(
    ...Object.values(domains)
      .filter(domain => domain.startForGettingReady$)
      .map(domain => domain.startForGettingReady$)
  ),

  /**
   * domain layer stop workflow
   * @returns {Observable}
   */
  stop$: concat(
    ...Object.values(domains)
      .filter(domain => domain.stop$)
      .map(domain => domain.stop$)
  ),

  /**
   * List of eventSourcingProcessorMap and its handlers for every EventSourcing event
   */
  eventSourcingProcessorMaps: Object.values(domains)
    .filter(domain => domain.eventSourcingProcessorMap)
    .map(domain => domain.eventSourcingProcessorMap),

  /**
   * List of CQRS request ProcessorMap and its handlers for every request
   */
  cqrsRequestProcessorMaps: Object.values(domains)
    .filter(domain => domain.cqrsRequestProcessorMap)
    .map(domain => domain.cqrsRequestProcessorMap),
    
    ...domains
};

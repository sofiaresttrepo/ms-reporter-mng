"use strict";

const { empty, Observable } = require("rxjs");
const eventStoreService = require("./EventStoreService")();

module.exports = {
  /**
   * start workflow
   * @returns {Observable}
   */
  start$: eventStoreService.start$(),
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: eventStoreService.syncState$(),
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: empty(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: eventStoreService.stop$(),
  /**
   * @returns {eventStoreService}
   */
  cqrsService: eventStoreService,
};

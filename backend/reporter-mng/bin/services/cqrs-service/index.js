"use strict";

const { empty, Observable } = require("rxjs");
const cqrsService = require("./CqrsService")();

module.exports = {
  /**
   * start workflow
   * @returns {Observable}
   */
  start$: cqrsService.start$(),
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: empty(),
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: empty(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: cqrsService.stop$(),
  /**
   * @returns {cqrsService}
   */
  cqrsService,
};

"use strict";

const { concat } = require("rxjs");
const mongoDB = require("./MongoDB").singleton();

module.exports = {
  /**
   * start workflow
   * @returns {Observable}
   */
  start$: mongoDB.start$(),
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: mongoDB.start$(),
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: concat(mongoDB.start$(),mongoDB.createIndexes$()),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: mongoDB.stop$(),
  /**
   * @returns {mongoDB}
   */
  mongoDB,
};

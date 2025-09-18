"use strict";

const { empty, Observable } = require("rxjs");
const eventSourcing = require("./EventSourcing")();

module.exports = {
  /**
   * start workflow
   * @returns {Observable}
   */
  start$: eventSourcing.start$(),
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: eventSourcing.start$(),
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: eventSourcing.start$(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: eventSourcing.stop$(),
  /**
   * @returns {eventSourcing}
   */
  eventSourcing,
};

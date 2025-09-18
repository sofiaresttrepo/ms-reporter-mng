"use strict";

const { of } = require("rxjs");

const VehicleStatsCRUD = require("./VehicleStatsCRUD")();
const VehicleStatsProcessor = require("./VehicleStatsProcessor")();
const DataAccess = require("./data-access/");

module.exports = {
  /**
   * domain start workflow
   */
  start$: DataAccess.start$,
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: DataAccess.start$,
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: of({}),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: DataAccess.stop$,
  /**
   * @returns {VehicleStatsCRUD}
   */
  VehicleStatsCRUD: VehicleStatsCRUD,
  /**
   * CRUD request processors Map
   */
  cqrsRequestProcessorMap: VehicleStatsCRUD.generateRequestProcessorMap(),
  /**
   * @returns {VehicleStatsProcessor}
   */
  VehicleStatsProcessor: VehicleStatsProcessor
};

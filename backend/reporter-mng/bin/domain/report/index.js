"use strict";

const { empty, Observable } = require("rxjs");

const ReportCRUD = require("./ReportCRUD")();
const ReportES = require("./ReportES")();
const DataAcess = require("./data-access/");

module.exports = {
  /**
   * domain start workflow
   */
  start$: DataAcess.start$,
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: DataAcess.start$,
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: empty(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: DataAcess.stop$,
  /**
   * @returns {ReportCRUD}
   */
  ReportCRUD: ReportCRUD,
  /**
   * CRUD request processors Map
   */
  cqrsRequestProcessorMap: ReportCRUD.generateRequestProcessorMap(),
  /**
   * @returns {ReportES}
   */
  ReportES,
  /**
   * EventSoircing event processors Map
   */
  eventSourcingProcessorMap: ReportES.generateEventProcessorMap(),
};

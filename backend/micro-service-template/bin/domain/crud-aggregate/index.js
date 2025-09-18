"use strict";

const { empty, Observable } = require("rxjs");

const CrudAggregateCRUD = require("./CrudAggregateCRUD")();
const CrudAggregateES = require("./CrudAggregateES")();
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
   * @returns {CrudAggregateCRUD}
   */
  CrudAggregateCRUD: CrudAggregateCRUD,
  /**
   * CRUD request processors Map
   */
  cqrsRequestProcessorMap: CrudAggregateCRUD.generateRequestProcessorMap(),
  /**
   * @returns {CrudAggregateES}
   */
  CrudAggregateES,
  /**
   * EventSoircing event processors Map
   */
  eventSourcingProcessorMap: CrudAggregateES.generateEventProcessorMap(),
};

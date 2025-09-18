"use strict";

const Rx = require('rxjs');

const CrudAggregateDA = require("./CrudAggregateDA");

module.exports = {
  /**
   * Data-Access start workflow
   */
  start$: Rx.concat(CrudAggregateDA.start$()),
  /**
   * @returns {CrudAggregateDA}
   */
  CrudAggregateDA: CrudAggregateDA,
};

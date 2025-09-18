"use strict";

const Rx = require('rxjs');

const ReportDA = require("./ReportDA");

module.exports = {
  /**
   * Data-Access start workflow
   */
  start$: Rx.concat(ReportDA.start$()),
  /**
   * @returns {ReportDA}
   */
  ReportDA: ReportDA,
};

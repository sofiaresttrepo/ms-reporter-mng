"use strict";

const { of } = require("rxjs");
const VehicleStatsDAFactory = require("./VehicleStatsDA");

// Get the class from the factory function
const VehicleStatsDA = VehicleStatsDAFactory().constructor;

module.exports = {
    start$: VehicleStatsDA.createIndexes$(),
    stop$: of({}),
    VehicleStatsDA: VehicleStatsDA
};

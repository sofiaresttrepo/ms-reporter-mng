'use strict'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}
const { concat } = require('rxjs');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

const crosscuttingLayer = require('../tools');
const serviceLayer = require('../services');
const domainLayer = require('../domain');

const start = () => {
    concat(
        // Start workflow 
        crosscuttingLayer.startForGettingReady$,        
        domainLayer.startForGettingReady$,
        serviceLayer.startForGettingReady$,
        // Stop workflow 
        serviceLayer.stop$,
        domainLayer.stop$,
        crosscuttingLayer.stop$,
    ).subscribe(
        (evt) => ConsoleLogger.i(`get-ready: ${evt}`),
        (error) => {
            console.error('get-ready: Failed', error);
            process.exit(1);
        },
        () => {
            ConsoleLogger.i('get-ready: Compelted');
            process.exit(0);
        }
    );
}

start();
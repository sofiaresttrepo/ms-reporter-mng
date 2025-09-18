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
       crosscuttingLayer.startForSyncing$,        
       domainLayer.startForSyncing$,
       serviceLayer.startForSyncing$,
       // Stop workflow 
       serviceLayer.stop$,
       domainLayer.stop$,
       crosscuttingLayer.stop$,
    ).subscribe(
        (evt) => ConsoleLogger.i(`event-store sync: ${(evt instanceof Object) ? JSON.stringify(evt) : evt}`),
        (error) => {
            console.error('event-store sync: Failed', error);
            process.exit(1);
        },
        () => {
            ConsoleLogger.i('event-store sync: Completed');
            process.exit(0);
        }
    );
}

start();




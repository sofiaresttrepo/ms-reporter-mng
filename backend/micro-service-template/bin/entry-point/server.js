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
        // initializing needed resources
        crosscuttingLayer.start$,
        // initializing domains        
        domainLayer.start$,
        // initializing SERVICE layers
        serviceLayer.start$,
    ).subscribe(
        (evt) => {
            ConsoleLogger.i(`server: ${JSON.stringify(evt)}`)
        },
        (error) => {
            console.error('server: Failed to start', error);
            process.exit(1);
        },
        () => ConsoleLogger.i('server: started')
    );
};

start();




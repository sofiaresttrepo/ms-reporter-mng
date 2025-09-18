"use strict";

const { bindNodeCallback, Observable } = require("rxjs");
const { map } = require("rxjs/operators");
const MongoClient = require("mongodb").MongoClient;
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

let instance = null;

class MongoDB {
  /**
   * initialize and configure Mongo DB
   * @param { { url, dbName } } ops
   */
  constructor({ url, dbName }) {
    this.url = url;
    this.dbName = dbName;
  }

  /**
   * Starts DB connections
   * @returns {Observable} Obserable that resolve to the DB client
   */
  start$() {
    return bindNodeCallback(MongoClient.connect)(this.url,
      {
         // retry to connect for 60 times
         reconnectTries: 4,
         // wait 1 second before retrying
         reconnectInterval: 250
      }).pipe(
      map(client => {
        ConsoleLogger.i(this.url);
        this.client = client;
        this.db = this.client.db(this.dbName);
        return `MongoDB connected to dbName= ${this.dbName}`;
      })
    );
  }

  /**
   * Stops DB connections
   * Returns an Obserable that resolve to a string log
   */
  stop$() {
    return Observable.create(observer => {
      this.running = false;
      this.client.close();
      observer.next("Mongo DB Client closed");
      observer.complete();
    });
  }

  /**
   * Ensure Index creation
   * Returns an Obserable that resolve to a string log
   */
  createIndexes$() {
    return Observable.create(async observer => {
      //observer.next('Creating index for DB_NAME.COLLECTION_NAME => ({ xxxx: 1 })  ');
      //await this.db.collection('COLLECTION_NAME').createIndex( { xxxx: 1});

      observer.next("All indexes created");
      observer.complete();
    });
  }

  /**
   * extracts every item in the mongo cursor, one by one
   * @param {*} cursor
   */
  extractAllFromMongoCursor$(cursor) {
    return Observable.create(async observer => {
      try {
        let obj = await MongoDB.extractNextFromMongoCursor(cursor);
        while (obj) {
          observer.next(obj);
          obj = await MongoDB.extractNextFromMongoCursor(cursor);
        }
        observer.complete();
      } catch (err) {
        observer.error(err);
      }

    });
  }

  /**
   * Extracts the next value from a mongo cursos if available, returns undefined otherwise
   * @param {*} cursor
   */
  static async extractNextFromMongoCursor(cursor) {
    const hasNext = await cursor.hasNext();
    if (hasNext) {
      const obj = await cursor.next();
      return obj;
    }
    return undefined;
  }
}

module.exports = {
  MongoDB,
  singleton() {
    if (!instance) {
      instance = new MongoDB({
        url: process.env.MONGODB_URL,
        dbName: process.env.MONGODB_DB_NAME
      });
      ConsoleLogger.i(`MongoDB instance created: ${process.env.MONGODB_DB_NAME}`);
    }
    return instance;
  }
};

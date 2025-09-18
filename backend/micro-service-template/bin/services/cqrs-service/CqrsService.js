"use strict";


const { of, from } = require("rxjs");
const { map, mergeMap, catchError, tap, mapTo } = require('rxjs/operators');
const jsonwebtoken = require("jsonwebtoken");
const { brokerFactory } = require('@nebulae/backend-node-tools').broker;
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { CqrsResponseHelper } = require('@nebulae/backend-node-tools').cqrs;
const { CustomError, PERMISSION_DENIED } = require("@nebulae/backend-node-tools").error;
const { RoleValidator } = require("@nebulae/backend-node-tools").auth;

const { cqrsRequestProcessorMaps } = require('../../domain');

const AVAILABLE_JWT_LIST = (process.env.AVAILABLE_JWT_LIST || "JWT_PUBLIC_KEY").split(",")
const broker = brokerFactory();
const permissionDeniedError = new CustomError('PermissionDenied', 'CqrsService.verifyRequest$', PERMISSION_DENIED, 'the user does not have the needed roles to execute this command/query');
let instance;

class CqrsService {

  constructor() {
    this.broker = brokerFactory();
    this.requestProcessMap = this.joinCqrsRequestProcessMap();
    this.subscriptions = [];
  }

  /**
   * Starts CQRS commands/queries listener
   */
  start$() {
    //default on error handler
    const onErrorHandler = (error) => {
      ConsoleLogger.e("Error handling  CQRS incoming event", error);
      process.exit(1);
    };

    //default onComplete handler
    const onCompleteHandler = () => {
      () => ConsoleLogger.e("CqrsService incoming action subscription completed");
    };

    return from(Object.keys(this.requestProcessMap)).pipe(
      map((aggregateType) => this.subscribeRequestHandler({ aggregateType, onErrorHandler, onCompleteHandler }))
    );
  }

  /**
   * build a Broker listener to handle CQRS requests procesor
   * @param {*} descriptor 
   */
  subscribeRequestHandler({
    aggregateType, onErrorHandler, onCompleteHandler
  }) {
    const messageTypes = Object.keys(this.requestProcessMap[aggregateType]);
    const subscription = broker
      .getMessageListener$([aggregateType], messageTypes).pipe(
        mergeMap(request =>
          this.verifyRequest$(aggregateType, request).pipe(
            mergeMap(request => (request.failedValidations.length > 0)
              ? of(request.errorResponse)
              : of(request).pipe(
                //ROUTE MESSAGE TO RESOLVER
                map(request => ({ ...request, handler: this.requestProcessMap[aggregateType][request.message.type] })),
                tap(({ authToken, message, type, handler }) => { if (!handler) throw new CustomError(`Missing CQRS handler: aggregateType: ${aggregateType}, messageType: ${message.type}`); }),
                mergeMap(({ authToken, message, handler }) =>
                  handler.fn.call(handler.instance, message.data, authToken).pipe(
                    map(response => ({ response, correlationId: message.id, replyTo: message.attributes.replyTo }))
                  )
                ),
              )
            ),
            mergeMap(msg => this.sendResponseBack$(msg).pipe(
              map(repsonseMessageId => ({ repsonseMessageId, response: msg, request }))
            )),
          )
        ),



      ).subscribe(
        ({ response, request }) => {
          if (response.response.result.error) {
            ConsoleLogger.e(`CqrsService.subscribeRequestHandler: aggregateType: ${request.topic}, messageType: ${request.type}, replyTo:${response.replyTo}, resultCode:${response.response.result.code}, resultError:${JSON.stringify(response.response.result.error)}`);
          } else {
            ConsoleLogger.d(`CqrsService.subscribeRequestHandler: aggregateType: ${request.topic}, messageType: ${request.type}, replyTo:${response.replyTo}, resultCode:${response.response.result.code}`);
          }
        },
        onErrorHandler,
        onCompleteHandler
      );
    this.subscriptions.push({
      aggregateType,
      messageTypes,
      subscription
    });

    return `CqrsService.subscribeRequestHandler: aggregateType:${aggregateType}, messageTypes:${messageTypes}`;
  }

  getJwtToken(jwt){
    let tempVal;
    return AVAILABLE_JWT_LIST.reduce((acc, element) => {
      const jwtVal = process.env[element];
      if(jwtVal){
        try {
          tempVal= jsonwebtoken.verify(jwt, jwtVal.replace(/\\n/g, "\n"), { algorithms: ['RS256'] });
          return tempVal;
        } catch (error) {
          return acc;
        }
      }else {
        return acc;
      }
    }, undefined);
  }

  /**
 * Verify the message if the request is valid.
 * @param {any} request request message
 * @returns { Rx.Observable< []{request: any, failedValidations: [] }>}  Observable object that containg the original request and the failed validations
 */
  verifyRequest$(aggregateType, request) {
    const { fn, instance, jwtValidation = {} } = this.requestProcessMap[aggregateType][request.type];
    let authToken = this.getJwtToken(request.data.jwt);
    return of(request).pipe(
      tap(r => {
        if(!authToken){
          throw new CustomError(`Missing JWT Key`);
        }
      }),
      //Verigf and decode JWT token
      map(message => ({ authToken: authToken, message, failedValidations: [] })),
      //Verifies the token has the needed users's attributes
      tap(({ authToken }) => {
        const missingAttributes = (jwtValidation.attributes || [])
          .filter(attribute => authToken[attribute] === undefined);
        if (missingAttributes.length > 0) {
          throw new CustomError(`Missing JWT attributes: ${JSON.stringify(missingAttributes)}`);
        }
      }),
      //Verifies the token has the needed user roles for the action
      tap(({ authToken }) => { if (!RoleValidator.hasRoles(authToken.realm_access.roles, jwtValidation.roles || [])) throw permissionDeniedError }),
      catchError(err => CqrsResponseHelper.handleError$(err)
        .pipe(
          map(response => ({
            errorResponse: { response, correlationId: request.id, replyTo: request.attributes.replyTo },
            failedValidations: ['JWT']
          }))
        )
      )
    );
  }

  /**
   * 
   * @param {any} msg Object with data necessary  to send response
   */
  sendResponseBack$(msg) {
    return of(msg).pipe(mergeMap(
      ({ response, correlationId, replyTo }) =>
        replyTo
          ? broker.send$(replyTo, "cqrs.response", response, {
            correlationId
          })
          : of(undefined)
    ));
  }

  stop$() {
    from(this.subscriptions).pipe(
      map(subscription => {
        if(subscription?.subscription != null)subscription.subscription.unsubscribe();
        return `${instance.constructor.name}.stop$: Unsubscribed`;
      })
    );
  }

  /**
   * Joins all the CQRS request processors maps in the domain
   * @return {*} joined map -> { AGGREGATE_TYPE vs { MESSAGE_TYPE vs {fn: HANDLER_FN, instance: HANDLER_INSTANCE}  } }
   */
  joinCqrsRequestProcessMap() {
    return cqrsRequestProcessorMaps.reduce(
      (acc, cqrsRequestProcessorMap) => {
        Object.keys(cqrsRequestProcessorMap).forEach(AggregateType => {
          if (!acc[AggregateType]) { acc[AggregateType] = {} }
          Object.keys(cqrsRequestProcessorMap[AggregateType]).forEach(MessageType => {
            acc[AggregateType][MessageType] = cqrsRequestProcessorMap[AggregateType][MessageType];
          })
        })
        return acc;
      },
      {}
    );
  }
}

/**
 * @returns {CqrsService}
 */
module.exports = () => {
  if (!instance) {
    instance = new CqrsService();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};

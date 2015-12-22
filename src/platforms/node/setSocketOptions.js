'use strict';

import WebSocket from 'websocket';

/**
 * TODO: Presently this is an unfinished implementation pending better JSPM support for NPM modules for Node consumption.
 *
 * Provides a platform specific function to set socket options.
 *
 * @param {string}   host - host name / port.
 * @param {boolean}  ssl - Indicates if an SSL connection is requested.
 * @param {object}   serializer - An instance of an object which conforms to JSON for serialization; default (JSON).
 * @param {string}   websocketPath - Defines the websocket path; default is `websocket`.
 * @return {object}
 */
export default function setSocketOptions(host, ssl = false, serializer = JSON, websocketPath = 'websocket')
{
   if (typeof host !== 'string')
   {
      throw new TypeError('setSocketOptions = `host` is not a string.');
   }

   if (typeof ssl !== 'boolean')
   {
      throw new TypeError('setSocketOptions = `ssl` is not a boolean.');
   }

   if (typeof serializer !== 'object' || typeof serializer.stringify !== 'function' ||
    typeof serializer.parse !== 'function')
   {
      throw new TypeError('setSocketOptions - `serializer` does not conform to the JSON API.');
   }

   return {
      type: 'websocket',
      endpoint: `${ssl ? 'wss://' : 'ws://'}${host}/${websocketPath}`,
      SocketConstructor: WebSocket.client,
      serializer
   };
}
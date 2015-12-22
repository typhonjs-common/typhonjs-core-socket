'use strict';

/**
 * Provides a platform specific function to set socket options.
 *
 * @param {string}   host - host name / port.
 * @param {boolean}  ssl - Indicates if an SSL connection is requested.
 * @param {object}   serializer - An instance of an object which conforms to JSON for serialization; default (JSON).
 * @param {string}   websocketPath - Defines the websocket path; default is `websocket`.
 * @param {string}   sockjsPath - Defines the sockjs path; default is `sockjs`.
 * @return {object}
 */
export default function setSocketOptions(host, ssl = false, serializer = JSON, websocketPath = 'websocket',
 sockjsPath = 'sockjs')
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

   const socketOptions = {};

   // If SockJS is available, use it, otherwise, use WebSocket. Note: SockJS is required for IE9 support
   if (typeof SockJS === 'function')
   {
      /* eslint-disable no-undef */
      socketOptions.type = 'sockjs';
      socketOptions.endpoint = `${ssl ? 'https://' : 'http://'}${host}/${sockjsPath}`;
      socketOptions.SocketConstructor = SockJS;
      socketOptions.serializer = serializer;
      /* eslint-enable no-undef */
   }
   else
   {
      socketOptions.type = 'websocket';
      socketOptions.endpoint = `${ssl ? 'wss://' : 'ws://'}${host}/${websocketPath}`;
      socketOptions.SocketConstructor = WebSocket;
      socketOptions.serializer = serializer;
   }

   return socketOptions;
}
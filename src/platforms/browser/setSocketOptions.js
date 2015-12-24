'use strict';

/**
 * Provides a platform specific function to set socket options.
 *
 * @param {object}   params - Defines an object hash of required and optional parameters including the following:
 * {string}   host - host name / port.
 * {boolean}  ssl - (optional) Indicates if an SSL connection is requested; default (false).
 * {object}   serializer - (optional) An instance of an object which conforms to JSON for serialization; default (JSON).
 * {boolean}  autoConnect - (optional) Indicates if socket should connect on construction; default (true).
 * {boolean}  autoReconnect - (optional) Indicates if socket should reconnect on socket closed; default (true).
 * {integer}  reconnectInterval - (optional) Indicates socket reconnect inteveral; default (10000) milliseconds.
 * {string}   protocol - (optional) Defines the websocket protocol; default (undefined).
 * {string}   websocketPath - (optional) Defines the websocket path; default (`websocket`).
 * {string}   sockjsPath - (optional) Defines the sockjs path; default (`sockjs`).
 * @return {object}
 */
export default function setSocketOptions(params = {})
{
   if (typeof params.host !== 'string')
   {
      throw new TypeError('setSocketOptions = `params.host` is not a string.');
   }

   params.ssl = params.ssl || false;

   if (typeof params.ssl !== 'boolean')
   {
      throw new TypeError('setSocketOptions = `params.ssl` is not a boolean.');
   }

   params.serializer = params.serializer || JSON;

   if (typeof params.serializer !== 'object' || typeof params.serializer.stringify !== 'function' ||
    typeof params.serializer.parse !== 'function')
   {
      throw new TypeError('setSocketOptions - `serializer` does not conform to the JSON API.');
   }

   params.autoConnect = params.autoConnect || true;
   params.autoReconnect = params.autoReconnect || true;
   params.reconnectInterval = params.reconnectInterval || 10000;

   if (typeof params.autoConnect !== 'boolean')
   {
      throw new TypeError('setSocketOptions = `params.autoConnect` is not a boolean.');
   }

   if (typeof params.autoReconnect !== 'boolean')
   {
      throw new TypeError('setSocketOptions = `params.autoReconnect` is not a boolean.');
   }

   if (!Number.isInteger(params.reconnectInterval))
   {
      throw new TypeError('setSocketOptions = `params.reconnectInterval` is not an integer.');
   }

   const socketOptions = {};

   // If SockJS is available, use it, otherwise, use WebSocket. Note: SockJS is required for IE9 support
   if (typeof SockJS === 'function')
   {
      params.sockjsPath = params.sockjsPath || 'sockjs';

      if (typeof params.sockjsPath !== 'string')
      {
         throw new TypeError('setSocketOptions = `params.sockjsPath` is not a string.');
      }

      /* eslint-disable no-undef */
      socketOptions.type = 'sockjs';
      socketOptions.host = params.host;
      socketOptions.ssl = params.ssl;
      socketOptions.endpoint = `${ssl ? 'https://' : 'http://'}${params.host}/${params.sockjsPath}`;
      socketOptions.SocketConstructor = SockJS;
      socketOptions.serializer = serializer;
      socketOptions.autoConnect = params.autoConnect;
      socketOptions.autoReconnect = params.autoReconnect;
      socketOptions.reconnectInterval = params.reconnectInterval;
      /* eslint-enable no-undef */
   }
   else
   {
      params.websocketPath = params.websocketPath || 'websocket';

      if (typeof params.websocketPath !== 'string')
      {
         throw new TypeError('setSocketOptions = `params.websocketPath` is not a string.');
      }

      socketOptions.type = 'websocket';
      socketOptions.host = params.host;
      socketOptions.ssl = params.ssl;
      socketOptions.endpoint = `${params.ssl ? 'wss://' : 'ws://'}${params.host}/${params.websocketPath}`;
      socketOptions.SocketConstructor = WebSocket;
      socketOptions.serializer = params.serializer;
      socketOptions.autoConnect = params.autoConnect;
      socketOptions.autoReconnect = params.autoReconnect;
      socketOptions.reconnectInterval = params.reconnectInterval;

      // Optionally set params.protocol if it exists.
      if (typeof params.protocol === 'string')
      {
         socketOptions.protocol = params.protocol;
      }
   }

   return socketOptions;
}
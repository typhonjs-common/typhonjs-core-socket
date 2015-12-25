'use strict';

/**
 * Provides a validation function to verify socket options.
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
export default function validateSocketOptions(params = {})
{
   if (typeof params.host !== 'string')
   {
      throw new TypeError('validateSocketOptions - `params.host` is not a string.');
   }

   if (typeof params.ssl !== 'boolean')
   {
      throw new TypeError('validateSocketOptions - `params.ssl` is not a boolean.');
   }

   if (typeof params.serializer !== 'object' || typeof params.serializer.stringify !== 'function' ||
    typeof params.serializer.parse !== 'function')
   {
      throw new TypeError('validateSocketOptions - `serializer` does not conform to the JSON API.');
   }

   if (typeof params.autoConnect !== 'boolean')
   {
      throw new TypeError('validateSocketOptions - `params.autoConnect` is not a boolean.');
   }

   if (typeof params.autoReconnect !== 'boolean')
   {
      throw new TypeError('validateSocketOptions - `params.autoReconnect` is not a boolean.');
   }

   if (!Number.isInteger(params.reconnectInterval))
   {
      throw new TypeError('validateSocketOptions - `params.reconnectInterval` is not an integer.');
   }

   if (typeof params.SocketConstructor !== 'function')
   {
      throw new TypeError('validateSocketOptions - `params.SocketConstructor` is not an constructor function.');
   }

   if (typeof options.endpoint !== 'string')
   {
      throw new Error('ctor - `options.endpoint` is missing or not a string.');
   }

   if (typeof params.type !== 'string')
   {
      throw new TypeError('validateSocketOptions - `params.type` is not a string.');
   }

   switch (params.type)
   {
      case 'sockjs':
         if (typeof params.sockjsPath !== 'string')
         {
            throw new TypeError('validateSocketOptions - `params.sockjsPath` is not a string.');
         }
         break;

      case 'websocket':
         if (typeof params.websocketPath !== 'string')
         {
            throw new TypeError('validateSocketOptions - `params.websocketPath` is not a string.');
         }

         // Optionally verify params.protocol if it exists.
         if (params.protocol && typeof params.protocol !== 'string')
         {
            throw new TypeError('validateSocketOptions - `params.protocol` is not a string.');
         }
         break;

      default:
         throw new TypeError('validateSocketOptions - `params.type` is not valid; must be `sockjs` or `websocket`.');
         break;
   }

   return true;
}
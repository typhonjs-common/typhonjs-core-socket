'use strict';

import TyphonEvents from 'typhonjs-core-backbone-events/src/TyphonEvents.js';

const s_STR_EVENT_CLOSE = 'socket:close';
const s_STR_EVENT_ERROR = 'socket:error';
const s_STR_EVENT_MESSAGE_IN = 'socket:message:in';
const s_STR_EVENT_MESSAGE_OUT = 'socket:message:out';
const s_STR_EVENT_SOCKET_OPEN = 'socket:open';

/**
 * Provides a socket connection and forwarding of data via TyphonEvents.
 */
export default class Socket extends TyphonEvents
{
   /**
    * Creates the socket.
    *
    * @param {object}   options - The options hash generated from `setSocketOptions` defining the socket configuration.
    */
   constructor(options = {})
   {
      super();

      if (typeof options !== 'object')
      {
         throw new Error('ctor - `options` is not an object / hash.');
      }

      if (typeof options.SocketConstructor !== 'function')
      {
         throw new Error('ctor - `options.SocketConstructor` is missing or not a constructor function.');
      }

      if (typeof options.endpoint !== 'string')
      {
         throw new Error('ctor - `options.endpoint` is missing or not a string.');
      }

      /**
       * The socket constructor.
       * @type {Function}
       */
      this.SocketConstructor = options.SocketConstructor;

      /**
       * Endpoint to connect.
       * @type {string}
       */
      this.endpoint = options.endpoint;

      /**
       * Protocol to connect.
       * @type {string}
       */
      this.protocol = options.protocol || undefined;

      /**
       * Defines the JSON compatible serializer or defaults to JSON.
       * @type {Object}
       */
      this.serializer = options.serializer || JSON;

      /**
       * Defines the type of socket connection ('websocket' or 'sockjs')
       * @type {string}
       */
      this.type = options.type || 'unknown';
   }

   /**
    * The `open`, `error` and `close` events are simply proxy-ed to `_socket`. The `message` event is instead parsed
    * into a js object (if possible) and then passed as a parameter of the `message:in` event.
    *
    * @returns {Socket}
    */
   connect()
   {
      switch(this.type)
      {
         case 'sockjs':
            /**
             * The raw socket.
             * @type {Object}
             */
            this.rawSocket = new this.SocketConstructor(this.endpoint);
            break;
         case 'websocket':
            if (typeof this.protocol !== 'undefined')
            {
               this.rawSocket = new this.SocketConstructor(this.endpoint, this.protocol);
            }
            else
            {
               this.rawSocket = new this.SocketConstructor(this.endpoint);
            }
            break;
         default:
            throw new Error(`connect - unknown 'type': ${this.type}`);
      }

      this.rawSocket.onclose = () => { super.triggerDefer(s_STR_EVENT_CLOSE); };

      this.rawSocket.onerror = (error) => { super.triggerDefer(s_STR_EVENT_ERROR, error); };

      this.rawSocket.onmessage = (message) =>
      {
         let object;

         try { object = this.serializer.parse(message.data); }
         catch(ignore) { return; /* ignore */ }

         // If there is an attached socket intercept function then invoke it.
         if (this._socketInterceptFunction)
         {
            this._socketInterceptFunction(s_STR_EVENT_MESSAGE_IN, message.data, object);
         }

         // Outside the try-catch block as it must only catch JSON parsing
         // errors, not errors that may occur inside a `message:in` event handler.
         super.triggerDefer(s_STR_EVENT_MESSAGE_IN, object);
      };

      this.rawSocket.onopen = () => { super.triggerDefer(s_STR_EVENT_SOCKET_OPEN); };

      return this;
   }

   /**
    * Disconnects / closes the socket.
    *
    * @returns {Socket}
    */
   disconnect()
   {
      this.rawSocket.close(...arguments);

      return this;
   }

   /**
    * Sends an object over the socket.
    *
    * @param {*}  object - The object to send.
    * @returns {Socket}
    */
   send(object)
   {
      const message = this.serializer.stringify(object);

      // If there is an attached socket intercept function then invoke it.
      if (this._socketInterceptFunction)
      {
         this._socketInterceptFunction(s_STR_EVENT_MESSAGE_OUT, message, object);
      }

      this.rawSocket.send(message);

      return this;
   }
}
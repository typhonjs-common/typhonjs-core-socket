'use strict';

import TyphonEvents           from 'typhonjs-core-backbone-events/src/TyphonEvents.js';

import validateSocketOptions  from './validateSocketOptions.js';

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
    * @param {object}   socketOptions - The options hash generated from `setSocketOptions` defining the socket
    *                                   configuration.
    */
   constructor(socketOptions = {})
   {
      super();

      if (validateSocketOptions(socketOptions))
      {
         /**
          * The socket constructor.
          * @type {Function}
          */
         this._params = socketOptions;
      }
   }

   /**
    * The `open`, `error` and `close` events are simply proxy-ed to `_socket`. The `message` event is instead parsed
    * into a js object (if possible) and then passed as a parameter of the `message:in` event.
    *
    * @returns {Socket}
    */
   connect()
   {
      switch(this._params.type)
      {
         case 'sockjs':
            /**
             * The raw socket.
             * @type {Object}
             */
            this.rawSocket = new this._params.SocketConstructor(this._params.endpoint);
            break;
         case 'websocket':
            if (typeof this._params.protocol !== 'undefined')
            {
               this.rawSocket = new this._params.SocketConstructor(this._params.endpoint, this._params.protocol);
            }
            else
            {
               this.rawSocket = new this._params.SocketConstructor(this._params.endpoint);
            }
            break;
         default:
            throw new Error(`connect - unknown 'type': ${this._params.type}`);
      }

      this.rawSocket.onclose = () => { super.triggerDefer(s_STR_EVENT_CLOSE); };

      this.rawSocket.onerror = (error) => { super.triggerDefer(s_STR_EVENT_ERROR, error); };

      this.rawSocket.onmessage = (message) =>
      {
         let object;

         try { object = this._params.serializer.parse(message.data); }
         catch(ignore) { return; /* ignore */ }

         // If there is an attached socket intercept function then invoke it.
         if (this._socketIntercept)
         {
            this._socketIntercept(s_STR_EVENT_MESSAGE_IN, message.data, object);
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
    * Returns any associated socket intercept function.
    *
    * @returns {function}
    */
   getSocketIntercept()
   {
      return this._socketIntercept;
   }

   /**
    * Sends an object over the socket.
    *
    * @param {*}  object - The object to send.
    * @returns {Socket}
    */
   send(object)
   {
      const message = this._params.serializer.stringify(object);

      // If there is an attached socket intercept function then invoke it.
      if (this._socketIntercept)
      {
         this._socketIntercept(s_STR_EVENT_MESSAGE_OUT, message, object);
      }

      this.rawSocket.send(message);

      return this;
   }

   /**
    * Sets the socket intercept function which is invoked when a message is sent or received.
    *
    * @param {function} interceptFunction - function that is invoked when a message is sent or received.
    */
   setSocketIntercept(interceptFunction)
   {
      if (typeof interceptFunction !== 'function')
      {
         throw new TypeError(`'interceptFunction' is not a 'function'.`);
      }

      this._socketIntercept = interceptFunction;
   }
}
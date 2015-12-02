'use strict';

import TyphonEvents from 'typhonjs-backbone-common/src/TyphonEvents.js';

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
    * @param {function} SocketConstructor - The socket constructor.
    * @param {string}   endpoint - Endpoint to connect.
    */
   constructor(SocketConstructor, endpoint)
   {
      super();

      /**
       * The socket constructor.
       * @type {Function}
       */
      this.SocketConstructor = SocketConstructor;

      /**
       * Endpoint to connect.
       * @type {string}
       */
      this.endpoint = endpoint;
   }

   /**
    * The `open`, `error` and `close` events are simply proxy-ed to `_socket`. The `message` event is instead parsed
    * into a js object (if possible) and then passed as a parameter of the `message:in` event.
    *
    * @returns {Socket}
    */
   connect()
   {
      /**
       * The raw socket.
       */
      this.rawSocket = new this.SocketConstructor(this.endpoint);

      this.rawSocket.onclose = () => { super.triggerDefer(s_STR_EVENT_CLOSE); };

      this.rawSocket.onerror = (error) => { super.triggerDefer(s_STR_EVENT_ERROR, error); };

      this.rawSocket.onmessage = (message) =>
      {
         let object;

         try { object = JSON.parse(message.data); }
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
    * Sends an object over the socket.
    *
    * @param {*}  object - The object to send.
    * @returns {Socket}
    */
   send(object)
   {
      const message = JSON.stringify(object);

      // If there is an attached socket intercept function then invoke it.
      if (this._socketInterceptFunction)
      {
         this._socketInterceptFunction(s_STR_EVENT_MESSAGE_OUT, message, object);
      }

      this.rawSocket.send(message);

      return this;
   }
}
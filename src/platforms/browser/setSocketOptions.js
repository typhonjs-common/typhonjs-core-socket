/**
 * Provides a platform specific function to set socket options.
 *
 * @param {object}   params - An object hash to write socket options into then freeze.
 * @param {string}   host - host name / port.
 * @param {boolean}  ssl - Indicates if an SSL connection is requested.
 * @param {object}   serializer - An instance of an object which conforms to JSON for serialization; default (JSON).
 * @param {string}   websocketPath - Defines the websocket path; default is `websocket`.
 * @param {string}   sockjsPath - Defines the sockjs path; default is `sockjs`.
 */
export default function setSocketOptions(params, host, ssl = false, serializer = JSON, websocketPath = 'websocket',
 sockjsPath = 'sockjs')
{
   if (typeof serializer !== 'object' || typeof serializer.stringify !== 'function' ||
    typeof serializer.parse !== 'function')
   {
      throw new TypeError('setSocketOptions - `serializer` does not conform to the JSON API.');
   }

   // If SockJS is available, use it, otherwise, use WebSocket. Note: SockJS is required for IE9 support
   if (typeof SockJS === 'function')
   {
      /* eslint-disable no-undef */
      params.socketOptions =
      {
         type: 'sockjs',
         endpoint: `${ssl ? 'https://' : 'http://'}${host}/${sockjsPath}`,
         SocketConstructor: SockJS,
         serializer
      };
      /* eslint-enable no-undef */
   }
   else
   {
      params.socketOptions =
      {
         type: 'websocket',
         endpoint: `${ssl ? 'wss://' : 'ws://'}${host}/${websocketPath}`,
         SocketConstructor: WebSocket,
         serializer
      };
   }
}
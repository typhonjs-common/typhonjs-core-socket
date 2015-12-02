/**
 * Provides a platform specific function to set socket options.
 *
 * @param {object}   params - An object hash to write socket options into then freeze.
 * @param {string}   host - host name / port.
 * @param {boolean}  ssl - Indicates if an SSL connection is requested.
 * @param {string}   websocketPath - Defines the websocket path; default is `websocket`.
 * @param {string}   sockjsPath - Defines the sockjs path; default is `sockjs`.
 */
export default function setSocketOptions(params, host, ssl, websocketPath = 'websocket', sockjsPath = 'sockjs')
{
   // If SockJS is available, use it, otherwise, use WebSocket. Note: SockJS is required for IE9 support
   if (typeof SockJS === 'function')
   {
      /* eslint-disable no-undef */
      params.endpoint = `${ssl ? 'https://' : 'http://'}${host}/${sockjsPath}`;

      params.socketOptions =
      {
         endpoint: params.endpoint,
         SocketConstructor: SockJS
      };
      /* eslint-enable no-undef */
   }
   else
   {
      params.endpoint = `${ssl ? 'wss://' : 'ws://'}${host}/${websocketPath}`;

      params.socketOptions =
      {
         endpoint: params.endpoint,
         SocketConstructor: WebSocket
      };
   }

   Object.freeze(params.socketOptions);
}
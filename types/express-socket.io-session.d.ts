// Type definitions for express-socket.io-session 1.3
// Project: https://github.com/oskosk/express-socket.io-session
// Definitions by: AylaJK <https://github.com/AylaJK>
// Modified by: simonzli <https://github.com/simonzli>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

declare module 'express-socket.io-session' {
  import socketio from 'socket.io';
  import express from 'express';
  import * as session from 'express-session';
  import { Client as RedstoneClient } from '@Models';

  module 'socket.io' {
    interface Handshake {
      session?: session.Session & {
        currentClient?: RedstoneClient;
        clientId?: number;
      };
      sessionID?: string;
    }
  }

  function sharedsession(
    expressSessionMiddleware: express.RequestHandler,
    cookieParserMiddleware: express.RequestHandler,
    options?: sharedsession.SharedSessionOptions): sharedsession.SocketIoSharedSessionMiddleware;

  function sharedsession(
    expressSessionMiddleware: express.RequestHandler,
    options?: sharedsession.SharedSessionOptions): sharedsession.SocketIoSharedSessionMiddleware;

  namespace sharedsession {
    interface SharedSessionOptions {
      autoSave?: boolean;
      saveUninitialized?: boolean;
    }

    type SocketIoSharedSessionMiddleware = (socket: socketio.Socket, next: (err?: any) => void) => void;
  }

  export default sharedsession;
}

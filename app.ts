import 'source-map-support/register';
import 'module-alias/register';
import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import Http from 'http';
import { Server as SocketIO } from 'socket.io';
import responseTime from 'response-time';
import bodyParser from 'body-parser';
import compression from 'compression';
import pino from 'express-pino-logger';
import favicon from 'serve-favicon';
import path from 'path';

import session from 'express-session';
import { sessionConfig, sessionStore } from '@Configs/session';
import http from '@Configs/http';
import cors from 'cors';
import securityConfig from '@Configs/security';

import loadRoutes from './loadRoutes';
import loadSequelize from './loadSequelize';
import loadAcl from '@Services/AccessControlService/initialize';
import { loadSocket } from './sockets';
import { errorHandler } from '@Responses';

const app = express();
const server = Http.createServer(app);
const socket = new SocketIO(server, {
  cors: securityConfig.cors,
  cookie: {
    name: 'redstone.sid',
    httpOnly: false,
  },
});

export async function liftServer(app: Express) {
  await loadSequelize();

  if (process.env.NODE_ENV === 'production') {
    app.use(pino());
  }
  app.use(responseTime());
  app.use(favicon(path.join(__dirname, 'assets/favicon.ico')));
  app.use(cors(securityConfig.cors));
  app.use(bodyParser.json());
  app.use(compression());
  const sess = session({
    ...sessionConfig,
    store: sessionStore(),
  });
  app.use(sess);
  app.use(http.middleware.bearerAuthentication);
  app.use(http.middleware.noCache);

  await loadSocket(socket);
  loadRoutes(app);
  await loadAcl();

  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'test') {
    server.listen(1337, () => {
      console.log('V2land Redstone started');
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  liftServer(app);
}

export { app, socket };
export default app;

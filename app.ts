import 'source-map-support/register';
import 'module-alias/register';
import dotenv from 'dotenv';

import express, { Express } from 'express';
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
import { errorHandler } from '@Responses';

dotenv.config();

const app = express();

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
  app.use(session({
    ...sessionConfig,
    store: sessionStore(),
  }));
  app.use(http.middleware.bearerAuthentication);
  app.use(http.middleware.noCache);

  loadRoutes(app);

  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'test') {
    app.listen(1337, () => {
      console.log('V2land Redstone started');
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  liftServer(app);
}

export default app;

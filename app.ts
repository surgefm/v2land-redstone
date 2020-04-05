import 'source-map-support/register';
import 'module-alias/register';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import pino from 'express-pino-logger';
import session from 'express-session';
import { sessionConfig, sessionStore } from '@Configs/session';
import http from '@Configs/http';

import loadRoutes from './loadRoutes';
import loadSequelize from './loadSequelize';

dotenv.config();

const app = express();

export async function liftServer(app: Express) {
  await loadSequelize();
  app.use(bodyParser.json());
  app.use(pino());
  app.use(session({
    ...sessionConfig,
    store: sessionStore(),
  }));
  app.use(http.middleware.bearerAuthentication);

  loadRoutes(app);

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

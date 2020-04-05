import 'source-map-support/register';
import 'module-alias/register';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import pino from 'express-pino-logger';
import session from 'express-session';
import { sessionConfig, sessionStore } from '@Configs/session';

import loadRoutes from './loadRoutes';
import loadSequelize from './loadSequelize';

dotenv.config();

const app = express();

(async () => {
  await loadSequelize();
  app.use(bodyParser.json());
  app.use(pino());
  app.use(session({
    ...sessionConfig,
    store: sessionStore(),
  }));

  loadRoutes(app);

  app.listen(1337, () => {
    console.log("V2land Redstone started");
  });
})();

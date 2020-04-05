import 'source-map-support/register';
import 'module-alias/register';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as pino from 'express-pino-logger';
import * as session from 'express-session';
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

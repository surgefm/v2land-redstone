import 'source-map-support/register';
import 'module-alias/register';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as pino from 'express-pino-logger';

import loadRoutes from './loadRoutes';
import loadSequelize from './loadSequelize';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(pino());

(async () => {
  loadRoutes(app);
  await loadSequelize();

  app.listen(1337, () => {
    console.log("V2land Redstone started");
  });
})();

/* eslint-disable no-invalid-this */
import 'source-map-support/register';
import 'module-alias/register';
import app, { liftServer } from '~/app';
require('../config/globals');
import dotenv from 'dotenv';
dotenv.config();

before(function(done) {
  this.timeout(30000);
  liftServer(app).then(done);
});

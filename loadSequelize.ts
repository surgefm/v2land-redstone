import { Sequelize } from 'sequelize-typescript';
import { datastores } from '@Configs';
import * as models from '@Models';
import * as pino from 'pino';
const logger = pino();

async function loadSequelize() {
  const { postgresql } = datastores;
  let logging: boolean | ((sql: string, timing?: number) => void) = false;
  if (process.env.NODE_ENV !== 'production' && process.env.SEQUELIZE_LOGGING !== 'false') {
    logging = (sql: string, timing: number) => {
      logger.info(`Time elapsed: ${timing}ms`, sql);
    };
  }

  const sequelize = new Sequelize({
    database: postgresql.database,
    dialect: 'postgres',
    username: postgresql.user,
    password: postgresql.password,
    host: postgresql.host,
    port: postgresql.port,
    modelPaths: Object.keys(models).map(model => (models as any)[model]),

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    logging,
  });

  await sequelize.sync();

  global.sequelize = sequelize;
}

export default loadSequelize;

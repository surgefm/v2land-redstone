/**
 * This is the configuration file for Sequelize database migration,
 * specifying the database connection methods.
 */

const { datastores } = require('./datastores');
const { postgresql } = datastores;

const connection = {
  ...postgresql,
  username: postgresql.user,
  dialect: 'postgres',
};

module.exports = {
  [process.env.NODE_ENV || 'development']: connection,
};

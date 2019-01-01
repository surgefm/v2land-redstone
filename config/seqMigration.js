/**
 * This is the configuration file for Sequelize database migration,
 * specifying the database connection methods.
 */

const { connections } = require('./connections');
const { postgresql } = connections;

const connection = {
  ...postgresql,
  username: postgresql.user,
  dialect: 'postgres',
};

module.exports = {
  [process.env.NODE_ENV || 'development']: connection,
};

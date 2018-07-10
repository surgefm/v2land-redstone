
const Sequelize = require('sequelize');

const {
  host,
  user,
  password,
  database,
} = sails.config.connections.postgresql;

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

module.exports = function init(sails) {

  return {

    initialize: function (cb) {
      sequelize
        .authenticate()
        .then(() => {
          sails.sequelize = sequelize;
          console.log('Connection has been established successfully.');
          cb();
        })
        .catch(err => {
          console.error('Unable to connect to the database:', err);
        });
    }

  }
}

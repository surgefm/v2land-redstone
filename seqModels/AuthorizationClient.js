const Sequelize = require('sequelize');

const AuthorizationClient = global.sequelize.define('authorizationClient', {
  name: Sequelize.TEXT,
  description: Sequelize.TEXT,
  redirectURI: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  allowAuthorizationByCredentials: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
}, {
  freezeTableName: true,
});

module.exports = AuthorizationClient;

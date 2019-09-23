const Sequelize = require('sequelize');

const AuthorizationCode = global.sequelize.define('authorizationCode', {
  code: Sequelize.TEXT,
  expire: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  url: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = AuthorizationCode;

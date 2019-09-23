const Sequelize = require('sequelize');

const AuthorizationAccessToken = global.sequelize.define('authorizationAccessToken', {
  token: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  refresh_token: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  expire: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'revoked'),
    defaultValue: 'active',
  },
}, {
  freezeTableName: true,
});

module.exports = AuthorizationAccessToken;

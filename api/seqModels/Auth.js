const Sequelize = require('sequelize');

const Auth = sails.sequelize.define('auth', {
  site: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  profileId: Sequelize.TEXT,
  profile: Sequelize.JSON,
  token: Sequelize.TEXT,
  tokenSecret: Sequelize.TEXT,
  accessToken: Sequelize.TEXT,
  accessTokenSecret: Sequelize.TEXT,
  refreshToken: Sequelize.TEXT,
  redirect: Sequelize.TEXT,
});

module.exports = Auth;

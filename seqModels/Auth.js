const Sequelize = require('sequelize');

const Auth = global.sequelize.define('auth', {
  site: {
    type: Sequelize.ENUM('twitter', 'weibo', 'email'),
    allowNull: false,
  },
  profileId: Sequelize.TEXT, // 微博/Twitter 的用户 uid
  profile: Sequelize.JSONB,
  token: Sequelize.TEXT,
  tokenSecret: Sequelize.TEXT,
  accessToken: Sequelize.TEXT,
  accessTokenSecret: Sequelize.TEXT,
  refreshToken: Sequelize.TEXT,
  redirect: Sequelize.TEXT,
}, {
  freezeTableName: true,
});

module.exports = Auth;

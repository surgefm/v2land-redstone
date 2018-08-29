const Sequelize = require('sequelize');

const Subscription = global.sequelize.define('subscription', {
  mode: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  method: {
    type: Sequelize.ENUM('twitter', 'weibo', 'twitterAt', 'weiboAt', 'email', 'emailDailyReport'),
    allowNull: false,
  },
  contact: {
    type: Sequelize.JSON,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'unsubscribed', 'failed'),
    defaultValue: 'active',
  },
  unsubscribeId: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = Subscription;

const Sequelize = require('sequelize');

const Subscription = sails.sequelize.define('subscription', {
  mode: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  method: {
    type: Sequelize.ENUM('twitter', 'weibo', 'twitterAt', 'weiboAt', 'email'),
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
});

module.exports = Subscription;

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
  isInstant: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isDailyReport: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  // Use the lastUpdate field to mark the latest notification time
  // so as to determine whether to send a notification.
  lastUpdate: {
    type: Sequelize.DATE,
    defaultValue: new Date('2000.1.1'),
  },
  unsubscribeId: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = Subscription;

const Sequelize = require('sequelize');

const Contact = global.sequelize.define('contact', {
  profileId: {
    type: Sequelize.TEXT,
  },
  type: {
    type: Sequelize.ENUM([
      'email',
      'twitter',
      'weibo',
      'telegram',
      'mobileApp',
    ]),
    allowNull: false,
  },
  method: {
    type: Sequelize.ENUM(
      'twitter',
      'weibo',
      'twitterAt',
      'weiboAt',
      'email',
      'emailDailyReport',
      'mobileAppNotification',
    ),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive', 'expired'),
    allowNull: false,
    defaultValue: 'active',
  },
  unsubscribeId: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
}, {
  freezeTableName: true,
});

module.exports = Contact;

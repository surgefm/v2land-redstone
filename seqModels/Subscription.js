const Sequelize = require('sequelize');

const Subscription = global.sequelize.define('subscription', {
  methods: {
    type: Sequelize.ARRAY(Sequelize.ENUM(
      'twitter',
      'weibo',
      'twitterAt',
      'weiboAt',
      'email',
      'emailDailyReport'
    )),
    defaultValue: [],
  },
  mode: {
    type: Sequelize.ENUM(
      'EveryNewStack',
      '30DaysSinceLatestStack',
      'new', '7DaysSinceLatestNews',
      'daily', 'weekly', 'monthly',
    ),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'unsubscribed'),
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

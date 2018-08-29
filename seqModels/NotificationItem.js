const Sequelize = require('sequelize');

const NotificationItem = global.sequelize.define('notificationitem', {
  time: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  content: {
    type: Sequelize.JSONB,
    allowNull: false,
  },
  type: {
    type: Sequelize.ENUM(
      'EveryNewStack',
      '30DaysSinceLatestStack',
      'new', '7DaysSinceLatestNews',
      'daily', 'weekly', 'monthly',
    ),
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = NotificationItem;

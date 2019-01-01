const Sequelize = require('sequelize');

const Notification = global.sequelize.define('notification', {
  time: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  mode: {
    type: Sequelize.ENUM(
      'EveryNewStack',
      '30DaysSinceLatestStack',
      'new', '7DaysSinceLatestNews',
      'daily', 'weekly', 'monthly',
      'EveryFriday',
    ),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM([
      'pending', 'ongoing', 'complete', 'discarded',
    ]),
    defaultValue: 'pending',
  },
}, {
  freezeTableName: true,
});

module.exports = Notification;

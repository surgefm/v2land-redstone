const Sequelize = require('sequelize');

const Notification = sails.sequelize.define('notification', {
  time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  mode: {
    type: Sequelize.ENUM(
      'new', '7DaysSinceLatestNews',
      'daily', 'weekly', 'monthly',
    ),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  },
});

module.exports = Notification;

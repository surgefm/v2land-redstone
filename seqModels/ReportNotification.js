const Sequelize = require('sequelize');

const ReportNotification = global.sequelize.define('reportNotification', {
  status: {
    type: Sequelize.ENUM([
      'pending', 'complete', 'invalid',
    ]),
    defaultValue: 'pending',
  },
}, {
  freezeTableName: true,
});

module.exports = ReportNotification;

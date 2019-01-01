const Sequelize = require('sequelize');

const Report = global.sequelize.define('report', {
  time: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date(),
  },
  type: {
    type: Sequelize.ENUM([
      'daily', 'weekly', 'monthly',
    ]),
    defaultValue: 'daily',
  },
  method: {
    type: Sequelize.ENUM([
      'email', 'telegram',
    ]),
    defaultValue: 'email',
  },
  status: {
    type: Sequelize.ENUM([
      'pending', 'ongoing', 'complete', 'invalid',
    ]),
    defaultValue: 'pending',
  },
}, {
  freezeTableName: true,
});

module.exports = Report;

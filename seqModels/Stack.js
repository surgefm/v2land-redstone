const Sequelize = require('sequelize');

const Stack = global.sequelize.define('stack', {
  title: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('pending', 'admitted', 'invalid', 'rejected', 'hidden', 'removed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  order: {
    type: Sequelize.INTEGER,
    defaultValue: -1,
  },
  time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = Stack;

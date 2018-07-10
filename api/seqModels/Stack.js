const Sequelize = require('sequelize');

const Stack = sails.sequelize.define('stack', {
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
});

module.exports = Stack;

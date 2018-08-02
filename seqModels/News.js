const Sequelize = require('sequelize');

const News = global.sequelize.define('news', {
  url: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  source: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  title: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  abstract: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      len: [2, 150],
    },
  },
  time: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('pending', 'admitted', 'rejected', 'removed'),
    defaultValue: 'pending',
  },
  comment: Sequelize.TEXT,
}, {
  freezeTableName: true,
});

module.exports = News;

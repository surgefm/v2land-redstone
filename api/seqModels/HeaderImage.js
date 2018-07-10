const Sequelize = require('sequelize');

const HeaderImage = sails.sequelize.define('headerimage', {
  imageUrl: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  source: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  sourceUrl: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});

module.exports = HeaderImage;

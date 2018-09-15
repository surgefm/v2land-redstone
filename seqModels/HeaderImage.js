const Sequelize = require('sequelize');

const HeaderImage = global.sequelize.define('headerImage', {
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
}, {
  freezeTableName: true,
});

module.exports = HeaderImage;

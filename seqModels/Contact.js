const Sequelize = require('sequelize');

const Contact = global.sequelize.define('contact', {
  type: {
    type: Sequelize.ENUM(['email', 'twitter', 'weibo', 'telegram']),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM('active', 'expired'),
    allowNull: false,
  },
}, {
  freezeTableName: true,
});

module.exports = Contact;

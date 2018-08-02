const Sequelize = require('sequelize');
const _ = require('lodash');

const Client = global.sequelize.define('client', {
  username: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: 'client_username_key',
    validate: {
      isUsername(value) {
        if (!_.isString(value) || value.length < 2 || value.length > 16) return false;
        if (/\r?\n|\r| |@/.test(value)) return false;

        let allDigit = true;
        for (const char of value) {
          if (!/\d/.test(char)) {
            allDigit = false;
            break;
          }
        }
        return !allDigit;
      },
    },
  },
  email: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: 'client_email_key',
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: false,
    validate: {
      isPassword(value) {
        return _.isString(value) && value.length >= 6 && value.match(/[A-z]/i) && value.match(/[0-9]/);
      },
    },
  },
  role: {
    type: Sequelize.ENUM('admin', 'manager', 'contributor'),
    allowNull: false,
    defaultValue: 'contributor',
  },
  emailVerified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Client;

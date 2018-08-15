const Sequelize = require('sequelize');
const _ = require('lodash');

const Event = global.sequelize.define('event', {
  name: {
    type: Sequelize.TEXT,
    allowNull: false,
    unique: 'event_name_key',
    validate: {
      isName(value) {
        if (!_.isString(value) || value.length === 0) return false;
        if (/\r?\n|\r| /.test(value)) return false;

        let allDigit = true;
        for (const char of value) {
          if (!/\d/.test(char)) {
            allDigit = false;
            break;
          }
        }
        if (allDigit) return false;

        const reserved = ['register', 'new', 'setting', 'admin',
          'about', 'subscription', 'index', 'login', 'verify', 'list',
          'pending', 'post'];

        return !reserved.includes(value);
      },
    },
  },
  pinyin: Sequelize.TEXT,
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM('pending', 'admitted', 'rejected', 'hidden', 'removed'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  freezeTableName: true,
});

module.exports = Event;

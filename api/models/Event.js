/**
 * Event.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true,
      unique: true,
      isName: true,
    },

    pinyin: {
      type: 'string',
    },

    description: {
      type: 'text',
      required: false,
    },

    status: {
      type: 'string',
      required: true,
      defaultsTo: 'pending',
      enum: ['pending', 'admitted', 'rejected', 'hidden', 'removed'],
    },

    subscribers: {
      collection: 'client',
      via: 'events',
    },

    news: {
      collection: 'news',
      via: 'event',
      dominant: true,
    },

    headerImage: {
      model: 'headerImage',
    },

    notifications: {
      collection: 'notification',
      via: 'event',
    },

    subscriptions: {
      collection: 'subscription',
      via: 'event',
    },

  },

  types: {

    isName: (value) => {
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
      if (reserved.includes(value)) return false;

      return true;
    },

  },

};

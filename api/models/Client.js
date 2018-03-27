/**
 * Client.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    username: {
      type: 'text',
      required: true,
      unique: true,
      isUsername: true,
    },

    email: {
      type: 'email',
      required: true,
      unique: true,
    },

    password: {
      type: 'text',
      required: true,
      isPassword: true,
    },

    role: {
      type: 'text',
      required: true,
      enum: ['admin', 'manager', 'contributor'],
      defaultsTo: 'contributor',
    },

    events: {
      collection: 'event',
      via: 'subscribers',
    },

    subscriptions: {
      collection: 'subscription',
      via: 'subscriber',
    },

    auths: {
      collection: 'auth',
      via: 'owner',
    },

    records: {
      collection: 'record',
      via: 'client',
    },

  },

  types: {
    isUsername: (value) => {
      if (!_.isString(value) || value.length < 2 || value.length > 16) return false;
      if (/\r?\n|\r| |@/.test(value)) return false;

      let allDigit = true;
      for (const char of value) {
        if (!/\d/.test(char)) {
          allDigit = false;
          break;
        }
      }
      if (allDigit) return false;

      return true;
    },
    isPassword: (value) => {
      return _.isString(value) && value.length >= 6 && value.match(/[A-z]/i) && value.match(/[0-9]/);
    },
  },

};

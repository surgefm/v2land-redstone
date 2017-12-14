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
    },

    password: {
      type: 'text',
      required: true,
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

  },

};

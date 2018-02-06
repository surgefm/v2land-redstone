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
    },

    description: {
      type: 'text',
      required: false,
    },

    status: {
      type: 'string',
      required: true,
      defaultsTo: 'pending',
      enum: ['pending', 'admitted', 'rejected', 'removed'],
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

};

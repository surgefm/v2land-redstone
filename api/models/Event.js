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
    },

    description: {
      type: 'text',
      required: false,
    },

    status: {
      type: 'string',
      required: true,
      defaultsTo: 'pending',
    },

    owner: {
      model: 'client',
    },

    news: {
      collection: 'news',
      via: 'event',
    },

    headerImage: {
      collection: 'headerImage',
      via: 'event',
    },

    notifications: {
      collection: 'notification',
      via: 'event'
    },
  }
};

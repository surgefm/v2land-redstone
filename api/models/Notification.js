/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    time: {
      type: 'date',
      required: true,
    },

    mode: {
      type: 'string',
      required: true,
      enum: [
        'new', '7DaysSinceLatestNews',
        'daily', 'weekly', 'monthly',
      ],
    },

    eventId: {
      model: 'event',
    },

    subscriptions: {
      collection: 'subscription',
      via: 'notification',
    },

    status: {
      type: 'string',
      required: true,
      defaultsTo: 'active',
      enum: ['active', 'inactive'],
    },

  },
};

/**
 * Subscription.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    mode: {
      type: 'string',
      required: true,
    },

    method: {
      type: 'string',
      required: true,
      enum: ['twitter', 'weibo', 'twitterAt', 'weiboAt', 'email'],
    },

    contact: {
      type: 'text',
      required: true,
    },

    status: {
      type: 'string',
      defaultsTo: 'active',
      enum: ['active', 'unsubscribed'],
    },

    unsubscribeId: {
      type: 'string',
      required: true,
    },

    subscriber: {
      model: 'client',
    },

    event: {
      model: 'event',
    },

    notification: {
      model: 'notification',
    },

  },

};

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

    // contact: {
    //   type: 'object',
    //   required: true,
    // },

    status: {
      type: 'string',
      defaultsTo: 'active',
    },

    unsubscribeId: {
      type: 'string',
      required: true,
    },

    subscriber: {
      model: 'client',
    },

  },

};

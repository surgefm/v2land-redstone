/**
 * Stack.js
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

    description: {
      type: 'text',
      required: false,
    },

    status: {
      type: 'string',
      required: true,
      defaultsTo: 'pending',
      enum: ['pending', 'admitted', 'invalid', 'rejected', 'hidden', 'removed'],
    },

    event: {
      model: 'event',
    },

    news: {
      collection: 'news',
      via: 'stack',
    },

    order: {
      type: 'number',
      defaultsTo: Number.MAX_SAFE_INTEGER,
    },

  },

};

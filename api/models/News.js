/**
 * News.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    url: {
      type: 'url',
      required: true,
    },

    source: {
      type: 'string',
      required: true,
    },

    title: {
      type: 'string',
      required: true,
    },

    abstract: {
      type: 'text',
      required: true,
      size: 150,
    },

    time: {
      type: 'date',
      required: true,
    },

    status: {
      type: 'string',
      defaultsTo: 'pending',
      enum: ['pending', 'admitted', 'rejected', 'removed'],
    },

    event: {
      model: 'event',
    },

  },
};

/**
 * Header-image.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    imageUrl: {
      type: 'url',
      required: true,
    },

    source: {
      type: 'string',
      required: true,
    },

    sourceUrl: {
      type: 'url',
      required: false,
    },

    eventId: {
      model: 'event',
      unique: true,
    },

  },
};

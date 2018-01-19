/**
 * Auth.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    site: {
      type: 'text',
      required: true,
    },

    profileId: {
      type: 'string',
    },

    profile: {
      type: 'text',
    },

    token: {
      type: 'string',
    },

    tokenSecret: {
      type: 'string',
    },

    accessToken: {
      type: 'string',
    },

    accessTokenSecret: {
      type: 'string',
    },

    refreshToken: {
      type: 'string',
    },

    redirect: {
      type: 'text',
    },

    owner: {
      model: 'client',
    },

  },
};

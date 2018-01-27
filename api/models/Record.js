module.exports = {

  attributes: {

    model: {
      type: 'string',
      required: true,
      enum: ['Event', 'News', 'Client', 'HeaderImage', 'Subscription'],
    },

    targetId: {
      type: 'number',
      required: true,
    },

    action: {
      type: 'string',
    },

    data: {
      type: 'text',
      required: true,
    },

    client: {
      model: 'client',
    },

  },
};

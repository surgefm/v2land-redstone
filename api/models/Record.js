module.exports = {

  attributes: {

    model: {
      type: 'string',
      required: true,
      enum: [
        'Event',
        'News',
        'Client',
        'HeaderImage',
        'Subscription',
        'Auth',
        'Miscellaneous',
      ],
    },

    target: {
      type: 'integer',
      required: true,
    },

    operation: {
      type: 'string',
      enum: [
        'create',
        'update',
        'destroy',
      ],
    },

    action: {
      type: 'string',
      enum: [
        'createEvent',
        'updateEventStatus',
        'updateEventDetail',
        'createEventHeaderImage',
        'updateEventHeaderImage',
        'createNews',
        'updateNewsStatus',
        'updateNewsDetail',
        'createSubscription',
        'updateSubscription',
        'cancelSubscription',
        'createClient',
        'updateClientRole',
        'updateClientDetail',
        'updateClientPassword',
        'createClientVerificationToken',
        'authorizeThirdPartyAccount',
        'unauthorizeThirdPartyAccount',
        'notify',
      ],
    },

    data: {
      type: 'json',
      required: true,
    },

    client: {
      model: 'client',
    },

  },
};

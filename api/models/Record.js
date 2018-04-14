module.exports = {

  attributes: {

    model: {
      type: 'string',
      required: true,
      enum: [
        'Event',
        'Stack',
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
        'createStack',
        'updateStackStatus',
        'updateStackDetail',
        'notifyNewStack',
        'createNews',
        'updateNewsStatus',
        'updateNewsDetail',
        'notifyNewNews',
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

    before: {
      type: 'json',
    },

    data: {
      type: 'json',
    },

    client: {
      model: 'client',
    },

  },
};

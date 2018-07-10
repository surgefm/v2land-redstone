const Sequelize = require('sequelize');

const Record = sails.sequelize.define('record', {
  model: {
    type: Sequelize.ENUM(
      'Event',
      'Stack',
      'News',
      'Client',
      'HeaderImage',
      'Subscription',
      'Auth',
      'Miscellaneous',
    ),
    allowNull: false,
  },
  target: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  operation: Sequelize.ENUM(
    'create',
    'update',
    'destroy',
  ),
  action: Sequelize.ENUM(
    'createEvent',
    'updateEventStatus',
    'updateEventDetail',
    'createEventHeaderImage',
    'updateEventHeaderImage',
    'createStack',
    'updateStackStatus',
    'updateStackDetail',
    'invalidateStack',
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
  ),
  before: Sequelize.JSON,
  data: Sequelize.JSON,
});

module.exports = Record;

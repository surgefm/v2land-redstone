/**
 * SubscriptionController
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  removeContact: require('./SubscriptionController/removeContact'),

  unsubscribe: require('./SubscriptionController/unsubscribe'),

  subscribe: require('./SubscriptionController/subscribe'),

};

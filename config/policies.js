/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */

module.exports.policies = {
  NewsController: {
    'findOne': true,
    'getNewsList': true,
    'updateNews': ['isLoggedIn', 'isManager'],
    'getAllPendingNews': ['isLoggedIn', 'isManager'],
    '*': false,
  },

  EventController: {
    'findEvent': true,
    'getEvent': true,
    'createEvent': true,
    'updateEvent': ['isLoggedIn', 'isManager'],
    'getEventList': true,
    'getAllPendingEvents': ['isLoggedIn', 'isManager'],
    'getPendingNews': ['isLoggedIn', 'isManager'],
    'createNews': true,
    'updateHeaderImage': ['isLoggedIn', 'isManager'],
    '*': false,
  },

  ClientController: {
    'updateClient': ['isLoggedIn'],
    'findClient': true,
    'login': true,
    'register': true,
    'changePassword': 'isLoggedIn',
    'updateRole': ['isLoggedIn', 'isAdmin'],
    'getClientList': ['isLoggedIn', 'isAdmin'],
    'getClientDetail': 'isLoggedIn',
    'logout': 'isLoggedIn',
    '*': false,
  },

  SubscriptionController: {
    'unsubscribe': true,
    'subscribe': true,
    '*': false,
  },

  HeaderImageController: {
    '*': false,
  },

  AuthController: {
    'options': true,
    'authorize': true,
    'unauthorize': true,
    'twitter': true,
    'twitterRedirect': true,
    'twitterCallback': true,
    'weibo': true,
    'weiboRedirect': true,
    'weiboCallback': true,
    '*': false,
  },

  UploadController: {
    'upload': ['isLoggedIn', 'isManager'],
    '*': false,
  },

};

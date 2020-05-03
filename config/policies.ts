/**
 * Policy Mappings
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 */

export default {
  NewsController: {
    'getNews': true,
    'getNewsList': true,
    'updateNews': ['isLoggedIn', 'isManager'],
    'getAllPendingNews': ['isLoggedIn', 'isManager'],
    '*': false,
  },

  EventController: {
    'addNews': ['isLoggedIn', 'isManager'],
    'findEvent': true,
    'getEvent': true,
    'createEvent': true,
    'updateEvent': ['isLoggedIn', 'isManager'],
    'getEventList': true,
    'getAllPendingEvents': ['isLoggedIn', 'isManager'],
    'getPendingNews': ['isLoggedIn', 'isManager'],
    'createStack': true,
    'createNews': true,
    'updateHeaderImage': ['isLoggedIn', 'isManager'],
    'addTag': ['isLoggedIn', 'isManager'],
    'removeTag': ['isLoggedIn', 'isManager'],
    'makeCommit': ['isLoggedIn', 'isManager'],
    'forkEvent': ['isLoggedIn'],
    '*': false,
  },

  StackController: {
    'getStack': true,
    'getStackList': true,
    'updateStack': ['isLoggedIn', 'isManager'],
    'updateMultipleStacks': ['isLoggedIn', 'isManager'],
    '*': false,
  },

  ClientController: {
    'inviteCode': true,
    'updateClient': ['isLoggedIn'],
    'findClient': true,
    'login': true,
    'register': true,
    'verifyToken': true,
    'changePassword': 'isLoggedIn',
    'updateRole': ['isLoggedIn', 'isAdmin'],
    'getClientList': ['isLoggedIn', 'isAdmin'],
    'getClientDetail': 'isLoggedIn',
    'logout': 'isLoggedIn',
    '*': false,
  },

  SubscriptionController: {
    'removeContact': true,
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

  OAuth2Controller: {
    '*': true,
  },

  UploadController: {
    'upload': ['isLoggedIn', 'isManager', 'uploadFile'],
    '*': false,
  },

  SearchController: {
    'keywordSearch': true,
    '*': false,
  },

  TagController: {
    'createTag': ['isLoggedIn', 'isManager'],
    'updateTag': ['isLoggedIn', 'isManager'],
    'getTag': true,
    'getTagList': true,
    '*': false,
  },

} as { [index: string]: { [index: string]: boolean | string | string[] }};

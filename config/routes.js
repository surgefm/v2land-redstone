/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  '/': {
    view: 'homepage'
  },

  'GET /code': 'ClientController.inviteCode',

  'GET /client': 'ClientController.getClientList',
  'POST /client': 'ClientController.getClientList',
  'POST /client/register': 'ClientController.register',
  'GET /client/me': 'ClientController.getClientDetail',
  'POST /client/login': 'ClientController.login',
  'PUT /client/role': 'ClientController.updateRole',
  'PUT /client/password': 'ClientController.changePassword',
  '/client/logout': 'ClientController.logout',
  'GET /client/verify': 'ClientController.verifyToken',
  'POST /client/verify': 'ClientController.verifyToken',
  'GET /client/:clientName': 'ClientController.findClient',
  'PUT /client/:clientName': 'ClientController.updateClient',

  'GET /event': 'EventController.getEventList',
  'POST /event/list': 'EventController.getEventList',
  'GET /event/pending': 'EventController.getAllPendingEvents',
  'POST /event': 'EventController.createEvent',
  'PUT /event/:eventName': 'EventController.updateEvent',
  'GET /event/:eventName/pending': 'EventController.getPendingNews',
  'POST /event/:eventName/stack': 'EventController.createStack',
  'POST /event/:eventName/news': 'EventController.createNews',
  'POST /event/:eventName/header_image': 'EventController.updateHeaderImage',
  'PUT /event/:eventName/header_image': 'EventController.updateHeaderImage',
  'GET /event/:eventName': 'EventController.getEvent',

  'GET /stack/:stackId': 'StackController.getStack',
  'POST /stack/list': 'StackController.getStackList',
  'PUT /stack/list': 'StackController.updateMultipleStacks',
  'PUT /stack/:stackId': 'StackController.updateStack',

  'GET /news/pending': 'NewsController.getAllPendingNews',
  'GET /news/:news': 'NewsController.getNews',
  'GET /news': 'NewsController.getNewsList',
  'POST /news': 'NewsController.getNewsList',
  'PUT /news/:news': 'NewsController.updateNews',

  'GET /subscription/unsubscribe/contact': 'SubscriptionController.removeContact',
  'GET /subscription/unsubscribe': 'SubscriptionController.unsubscribe',
  'POST /subscription/:eventName': 'SubscriptionController.subscribe',

  'GET /auth/options': 'AuthController.options',
  'POST /auth': 'AuthController.authorize',
  'DELETE /auth/:authId': 'AuthController.unauthorize',
  'GET /auth/twitter': 'AuthController.twitter',
  'GET /auth/twitter/callback': 'AuthController.twitterCallback',
  'GET /auth/twitter/redirect': 'AuthController.twitterRedirect',
  'GET /auth/weibo': 'AuthController.weibo',
  'GET /auth/weibo/callback': 'AuthController.weiboCallback',
  'GET /auth/weibo/redirect': 'AuthController.weiboRedirect',

  'POST /upload': 'UploadController.upload',

  'GET /search': 'SearchController.keywordSearch',

}

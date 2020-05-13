export default {

  '/': {
    view: 'homepage',
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
  'PUT /event/:eventName/news': 'EventController.addNews',
  'POST /event/:eventName/tag': 'EventController.addTag',
  'POST /event/:eventName/commit': 'EventController.makeCommit',
  'GET /event/:eventName/fork': 'EventController.forkEvent',
  'DELETE /event/:eventName/tag/:tagId': 'EventController.removeTag',
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

  'GET /oauth2/grant': 'OAuth2Controller.grant',

  'POST /upload': 'UploadController.upload',

  'GET /search': 'SearchController.keywordSearch',

  'GET /tag': 'TagController.getTagList',
  'POST /tag': 'TagController.createTag',
  'PUT /tag/:tagId': 'TagController.updateTag',
  'GET /tag/:tagId': 'TagController.getTag',

  'GET /role/:clientId': 'RoleController.getClientRoles',
  'GET /role/:clientId/:resourceId/:action': 'RoleController.checkPermissionOnResource',
  'POST /role/role/edit': 'RoleController.updateClientRole',
  'DELETE /role/role/edit': 'RoleController.updateClientRole',
  'POST /role/permission/edit': 'RoleController.updateClientPermission',
  'DELETE /role/permission/edit': 'RoleController.updateClientPermission',

} as { [index: string]: string | { view: string } };

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

import { hasPermission, hasEventPermission, hasStackPermission, hasEventPermissionForSomeStatus, hasRolePermission, hasTagPermission } from '@Policies';

export default {
  NewsController: {
    'getNews': true,
    'getNewsList': true,
    'updateNews': ['isLoggedIn', 'isEditor'],
    'getAllPendingNews': ['isLoggedIn', 'isEditor'],
    '*': false,
  },

  EventController: {
    'addNews': ['isLoggedIn', 'isEditor'],
    'findEvent': true,
    'getEvent': hasEventPermissionForSomeStatus('用户没有查看事件的权限'),
    'createEvent': ['isLoggedIn'],
    'updateEvent': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'getEventList': true,
    'getAllPendingEvents': ['isLoggedIn', 'isEditor'],
    'getPendingNews': ['isLoggedIn', hasPermission('news', 'edit', '用户没有编辑新闻的权限')],
    'createStack': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'createNews': ['isLoggedIn', hasEventPermission('edit', '用户没有创建新闻的权限')],
    'updateHeaderImage': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'addTag': ['isLoggedIn', hasPermission('tags', 'add', '用户没有添加标签的权限')],
    'removeTag': ['isLoggedIn', hasPermission('tags', 'remove', '用户没有移除标签的权限')],
    'makeCommit': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'forkEvent': ['isLoggedIn', hasPermission('events', 'create', '用户没有复制事件的权限')],
    '*': false,
  },

  StackController: {
    'getStack': true,
    'getStackList': true,
    'updateStack': ['isLoggedIn', hasStackPermission('edit', '用户没有编辑事件的权限')],
    'updateMultipleStacks': ['isLoggedIn', hasStackPermission('edit', '用户没有编辑事件的权限')],
    'addEvent': ['isLoggedIn', hasStackPermission('edit', '用户没有编辑事件的权限')],
    'removeEvent': ['isLoggedIn', hasStackPermission('edit', '用户没有编辑事件的权限')],
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
    'getClientList': 'isLoggedIn',
    'getClientDetail': 'isLoggedIn',
    'logout': 'isLoggedIn',
    'getInviteCode': 'isLoggedIn',
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
    'google': true,
    'googleRedirect': true,
    'googleCallback': true,
    'telegramRedirect': true,
    '*': false,
  },

  OAuth2Controller: {
    '*': true,
  },

  UploadController: {
    'upload': ['isLoggedIn', 'uploadFile'],
    '*': false,
  },

  SearchController: {
    'keywordSearch': true,
    '*': false,
  },

  TagController: {
    'createTag': ['isLoggedIn'],
    'updateTag': ['isLoggedIn', hasTagPermission('edit', '用户没有更改该话题的权限')],
    'getTag': true,
    'getTagList': true,
    'addCurator': ['isLoggedIn', 'isEditor'],
    'removeCurator': ['isLoggedIn', 'isEditor'],
    '*': false,
  },

  RoleController: {
    'getClientRoles': ['isLoggedIn', hasRolePermission('view', '用户没有查看请求的用户信息的权限')],
    'checkPermissionOnResource': ['isLoggedIn', hasRolePermission('view', '用户没有查看请求的用户信息的权限')],
    'updateClientRole': ['isLoggedIn', hasRolePermission('edit', '用户没有更改请求的用户信息的权限')],
    'updateClientPermission': ['isLoggedIn', hasRolePermission('edit', '用户没有更改请求的用户信息的权限')],
  },

} as { [index: string]: { [index: string]: boolean | string | string[] | object } };

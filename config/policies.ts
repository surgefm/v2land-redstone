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

import { hasPermission, hasEventPermission, hasEventPermissionForSomeStatus } from '@Policies';

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
    'getEvent': ['isLoggedIn', hasEventPermissionForSomeStatus('用户没有查看事件的权限')],
    'createEvent': ['isLoggedIn', hasPermission('events', 'create', '用户没有创建事件的权限')],
    'updateEvent': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'getEventList': true,
    'getAllPendingEvents': ['isLoggedIn', 'isManager'],
    'getPendingNews': ['isLoggedIn', hasPermission('news', 'edit', '用户没有编辑新闻的权限')],
    'createStack': ['isLoggedIn', hasEventPermission('edit', '用户没有编辑事件的权限')],
    'createNews': ['isLoggedIn', hasPermission('news', 'create', '用户没有创建新闻的权限')],
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

} as { [index: string]: { [index: string]: boolean | string | string[] } };

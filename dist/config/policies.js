"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const _Policies_1 = require("@Policies");
exports.default = {
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
        'getEvent': (0, _Policies_1.hasEventPermissionForSomeStatus)('用户没有查看事件的权限'),
        'createEvent': ['isLoggedIn'],
        'updateEvent': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有编辑事件的权限')],
        'getEventList': true,
        'getAllPendingEvents': ['isLoggedIn', 'isEditor'],
        'getPendingNews': ['isLoggedIn', (0, _Policies_1.hasPermission)('news', 'edit', '用户没有编辑新闻的权限')],
        'createStack': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有编辑事件的权限')],
        'createNews': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有创建新闻的权限')],
        'updateHeaderImage': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有编辑事件的权限')],
        'addTag': ['isLoggedIn', (0, _Policies_1.hasPermission)('tags', 'add', '用户没有添加标签的权限')],
        'removeTag': ['isLoggedIn', (0, _Policies_1.hasPermission)('tags', 'remove', '用户没有移除标签的权限')],
        'makeCommit': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有编辑事件的权限')],
        'forkEvent': ['isLoggedIn', (0, _Policies_1.hasPermission)('events', 'create', '用户没有复制事件的权限')],
        'notifySubscriber': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有编辑事件的权限')],
        'star': ['isLoggedIn'],
        'unstar': ['isLoggedIn'],
        'getStars': true,
        '*': false,
    },
    StackController: {
        'getStack': true,
        'getStackList': true,
        'updateStack': ['isLoggedIn', (0, _Policies_1.hasStackPermission)('edit', '用户没有编辑事件的权限')],
        'updateMultipleStacks': ['isLoggedIn', (0, _Policies_1.hasStackPermission)('edit', '用户没有编辑事件的权限')],
        'addEvent': ['isLoggedIn', (0, _Policies_1.hasStackPermission)('edit', '用户没有编辑事件的权限')],
        'removeEvent': ['isLoggedIn', (0, _Policies_1.hasStackPermission)('edit', '用户没有编辑事件的权限')],
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
        'createMcpToken': 'isLoggedIn',
        'getMcpTokenStatus': 'isLoggedIn',
        'revokeMcpToken': 'isLoggedIn',
        '*': false,
    },
    SubscriptionController: {
        'removeContact': true,
        'unsubscribe': true,
        'subscribe': true,
        'pwaSubscribe': true,
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
        'appleRedirect': true,
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
        'updateTag': ['isLoggedIn', (0, _Policies_1.hasTagPermission)('edit', '用户没有更改该话题的权限')],
        'getTag': true,
        'getTagList': true,
        'getTagListByAlphabet': true,
        'getTagListStats': true,
        'addCurator': ['isLoggedIn', (0, _Policies_1.hasTagParentPermission)('edit', '用户没有给该话题添加主持人的权限')],
        'addCuration': ['isLoggedIn', (0, _Policies_1.hasTagPermission)('edit', '用户没有更改该话题的权限')],
        'removeCurator': ['isLoggedIn', (0, _Policies_1.hasTagParentPermission)('edit', '用户没有给该话题添加主持人的权限')],
        '*': false,
    },
    RoleController: {
        'getClientRoles': ['isLoggedIn', (0, _Policies_1.hasRolePermission)('view', '用户没有查看请求的用户信息的权限')],
        'checkPermissionOnResource': ['isLoggedIn', (0, _Policies_1.hasRolePermission)('view', '用户没有查看请求的用户信息的权限')],
        'updateClientRole': ['isLoggedIn', (0, _Policies_1.hasRolePermission)('edit', '用户没有更改请求的用户信息的权限')],
        'updateClientPermission': ['isLoggedIn', (0, _Policies_1.hasRolePermission)('edit', '用户没有更改请求的用户信息的权限')],
    },
    ChatController: {
        'getPopularChatrooms': true,
        'getClientChatrooms': ['isLoggedIn'],
        'loadChatMessages': ['isLoggedIn'],
    },
    ExtractionController: {
        'extract': ['isLoggedIn'],
    },
    AgentController: {
        'runAgent': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有运行 Bot 的权限')],
        'getAgentStatus': ['isLoggedIn'],
        'getAgentHistory': ['isLoggedIn'],
        'stopAgent': ['isLoggedIn', (0, _Policies_1.hasEventPermission)('edit', '用户没有停止 Bot 的权限')],
    },
};

//# sourceMappingURL=policies.js.map

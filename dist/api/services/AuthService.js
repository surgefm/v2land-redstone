"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteName = exports.sanitize = void 0;
function sanitize(auth) {
    for (const property of ['token', 'tokenSecret',
        'accessToken', 'accessTokenSecret', 'refreshToken']) {
        delete auth[property];
    }
    return auth;
}
exports.sanitize = sanitize;
function getSiteName(method) {
    switch (method) {
        case 'twitterAt':
            return 'twitter';
        case 'weiboAt':
            return 'weibo';
        default:
            return method;
    }
}
exports.getSiteName = getSiteName;

//# sourceMappingURL=AuthService.js.map

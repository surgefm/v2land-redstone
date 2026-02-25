"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeFromMethod = void 0;
function getTypeFromMethod(method) {
    switch (method) {
        case 'emailDailyReport':
            return 'email';
        case 'twitterAt':
            return 'twitter';
        case 'weiboAt':
            return 'weibo';
        case 'mobileAppNotification':
            return 'mobileApp';
        default:
            return method;
    }
}
exports.getTypeFromMethod = getTypeFromMethod;

//# sourceMappingURL=ContactService.js.map

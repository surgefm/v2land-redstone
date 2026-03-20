"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRedisResourceLockKey(model, resourceId) {
    return `resource-lock-${model}-${resourceId}`;
}
exports.default = getRedisResourceLockKey;

//# sourceMappingURL=getRedisResourceLockKey.js.map

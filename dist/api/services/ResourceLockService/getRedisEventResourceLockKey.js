"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRedisEventResourceLockKey(eventId) {
    return `resource-lock:event-${eventId}`;
}
exports.default = getRedisEventResourceLockKey;

//# sourceMappingURL=getRedisEventResourceLockKey.js.map

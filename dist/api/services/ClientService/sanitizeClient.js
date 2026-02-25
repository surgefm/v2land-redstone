"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizedFields = void 0;
exports.sanitizedFields = ['username', 'nickname', 'id', 'description', 'avatar', 'role'];
const otherFields = [
    'email', 'emailVerified', 'settings', 'records', 'auths',
    'subscriptions', 'contacts', 'reports', 'tags', 'events', 'subscriptionCount',
];
function sanitizeClient(client, forAdmin = false) {
    const temp = {};
    for (const attr of [...exports.sanitizedFields, 'events', 'stars', 'curatorRoles']) {
        temp[attr] = client[attr];
    }
    if (forAdmin) {
        for (const attr of otherFields) {
            temp[attr] = client[attr];
        }
    }
    if (client.objectID) {
        temp.objectID = client.objectID;
    }
    return temp;
}
exports.default = sanitizeClient;

//# sourceMappingURL=sanitizeClient.js.map

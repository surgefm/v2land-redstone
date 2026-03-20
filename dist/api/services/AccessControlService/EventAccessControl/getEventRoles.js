"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventOwnerRole = exports.getEventManageRole = exports.getEventEditRole = exports.getEventViewRole = exports.getEventOwnerRolePlain = exports.getEventManageRolePlain = exports.getEventEditRolePlain = exports.getEventViewRolePlain = exports.getEventResourceId = void 0;
const operations_1 = require("@Services/AccessControlService/operations");
const getEventResourceId = (eventId) => `event-${eventId}`;
exports.getEventResourceId = getEventResourceId;
const getEventViewRolePlain = (eventId) => `${(0, exports.getEventResourceId)(eventId)}-view-role`;
exports.getEventViewRolePlain = getEventViewRolePlain;
const getEventEditRolePlain = (eventId) => `${(0, exports.getEventResourceId)(eventId)}-edit-role`;
exports.getEventEditRolePlain = getEventEditRolePlain;
const getEventManageRolePlain = (eventId) => `${(0, exports.getEventResourceId)(eventId)}-manage-role`;
exports.getEventManageRolePlain = getEventManageRolePlain;
const getEventOwnerRolePlain = (eventId) => `${(0, exports.getEventResourceId)(eventId)}-owner-role`;
exports.getEventOwnerRolePlain = getEventOwnerRolePlain;
function getEventViewRole(eventId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = (0, exports.getEventResourceId)(eventId);
        const role = (0, exports.getEventViewRolePlain)(eventId);
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(role, resource, 'view');
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(role, resource, 'view');
        }
        return role;
    });
}
exports.getEventViewRole = getEventViewRole;
function getEventEditRole(eventId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = (0, exports.getEventResourceId)(eventId);
        const editRole = (0, exports.getEventEditRolePlain)(eventId);
        const permissions = ['edit', 'makeCommit'];
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(editRole, resource, permissions);
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(editRole, resource, permissions);
            const viewRole = yield getEventViewRole(eventId);
            yield (0, operations_1.addRoleParents)(editRole, viewRole);
        }
        return editRole;
    });
}
exports.getEventEditRole = getEventEditRole;
function getEventManageRole(eventId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = (0, exports.getEventResourceId)(eventId);
        const manageRole = (0, exports.getEventManageRolePlain)(eventId);
        const permissions = ['addViewer', 'removeViewer', 'addEditor', 'removeEditor'];
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(manageRole, resource, permissions);
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(manageRole, resource, permissions);
            const editRole = yield getEventEditRole(eventId);
            yield (0, operations_1.addRoleParents)(manageRole, editRole);
        }
        return manageRole;
    });
}
exports.getEventManageRole = getEventManageRole;
function getEventOwnerRole(eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ownerRole = (0, exports.getEventOwnerRolePlain)(eventId);
        const manageRole = yield getEventManageRole(eventId);
        yield (0, operations_1.addRoleParents)(ownerRole, manageRole);
        return ownerRole;
    });
}
exports.getEventOwnerRole = getEventOwnerRole;

//# sourceMappingURL=getEventRoles.js.map

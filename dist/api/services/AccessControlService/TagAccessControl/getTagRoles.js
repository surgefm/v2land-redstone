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
exports.getTagManageRole = exports.getTagViewRole = exports.getTagManageRolePlain = exports.getTagViewRolePlain = exports.getTagResourceId = void 0;
const operations_1 = require("@Services/AccessControlService/operations");
const getTagResourceId = (tagId) => `tag-${tagId}`;
exports.getTagResourceId = getTagResourceId;
const getTagViewRolePlain = (tagId) => `${(0, exports.getTagResourceId)(tagId)}-view-role`;
exports.getTagViewRolePlain = getTagViewRolePlain;
const getTagManageRolePlain = (tagId) => `${(0, exports.getTagResourceId)(tagId)}-manage-role`;
exports.getTagManageRolePlain = getTagManageRolePlain;
function getTagViewRole(tagId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = (0, exports.getTagResourceId)(tagId);
        const role = (0, exports.getTagViewRolePlain)(tagId);
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(role, resource, 'view');
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(role, resource, 'view');
        }
        return role;
    });
}
exports.getTagViewRole = getTagViewRole;
function getTagManageRole(tagId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = (0, exports.getTagResourceId)(tagId);
        const manageRole = (0, exports.getTagManageRolePlain)(tagId);
        const permissions = ['addViewer', 'removeViewer', 'addEditor', 'removeEditor'];
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(manageRole, resource, permissions);
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(manageRole, resource, permissions);
            const viewRole = yield getTagViewRole(tagId);
            yield (0, operations_1.addRoleParents)(manageRole, viewRole);
        }
        return manageRole;
    });
}
exports.getTagManageRole = getTagManageRole;

//# sourceMappingURL=getTagRoles.js.map

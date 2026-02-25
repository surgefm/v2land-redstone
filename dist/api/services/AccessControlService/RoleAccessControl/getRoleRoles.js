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
exports.getRoleEditRole = exports.getRoleEditRolePlain = void 0;
const operations_1 = require("@Services/AccessControlService/operations");
function getRoleResourceId(clientId) {
    return `role-${clientId}`;
}
const getRoleEditRolePlain = (clientId) => `${getRoleResourceId(clientId)}-edit-role`;
exports.getRoleEditRolePlain = getRoleEditRolePlain;
function getRoleEditRole(clientId, forceUpdate = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const resource = getRoleResourceId(clientId);
        const editRole = (0, exports.getRoleEditRolePlain)(clientId);
        const permissions = ['edit'];
        const isAllowed = yield (0, operations_1.areAnyRolesAllowed)(editRole, resource, permissions);
        if (!isAllowed || forceUpdate) {
            yield (0, operations_1.allow)(editRole, resource, permissions);
        }
        return editRole;
    });
}
exports.getRoleEditRole = getRoleEditRole;

//# sourceMappingURL=getRoleRoles.js.map

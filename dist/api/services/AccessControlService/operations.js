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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatResources = exports.userRoles = exports.removeUserRoles = exports.removeRoleParents = exports.removeRole = exports.removeResource = exports.removePermissions = exports.removeAllow = exports.isAllowed = exports.hasRole = exports.allow = exports.addUserRoles = exports.addRoleParents = exports.roleUsers = exports.areAnyRolesAllowed = void 0;
const acl_1 = __importDefault(require("./acl"));
function areAnyRolesAllowed(roles, resources, permissions) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            acl_1.default.areAnyRolesAllowed(roles, resources, permissions, (err, allowed) => {
                if (err)
                    return reject(err);
                resolve(allowed);
            });
        });
    });
}
exports.areAnyRolesAllowed = areAnyRolesAllowed;
function roleUsers(role) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            acl_1.default.roleUsers(role, (err, users) => {
                if (err)
                    return reject(err);
                resolve(users);
            });
        });
    });
}
exports.roleUsers = roleUsers;
exports.addRoleParents = acl_1.default.addRoleParents.bind(acl_1.default);
exports.addUserRoles = acl_1.default.addUserRoles.bind(acl_1.default);
exports.allow = acl_1.default.allow.bind(acl_1.default);
exports.hasRole = acl_1.default.hasRole.bind(acl_1.default);
exports.isAllowed = acl_1.default.isAllowed.bind(acl_1.default);
exports.removeAllow = acl_1.default.removeAllow.bind(acl_1.default);
exports.removePermissions = acl_1.default.removePermissions.bind(acl_1.default);
exports.removeResource = acl_1.default.removeResource.bind(acl_1.default);
exports.removeRole = acl_1.default.removeRole.bind(acl_1.default);
exports.removeRoleParents = acl_1.default.removeRoleParents.bind(acl_1.default);
exports.removeUserRoles = acl_1.default.removeUserRoles.bind(acl_1.default);
exports.userRoles = acl_1.default.userRoles.bind(acl_1.default);
exports.whatResources = acl_1.default.whatResources.bind(acl_1.default);

//# sourceMappingURL=operations.js.map

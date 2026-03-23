"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasRolePermission = exports.uploadFile = exports.sessionAuth = exports.isEditor = exports.isManager = exports.isLoggedIn = exports.isAdmin = exports.hasTagPermission = exports.hasTagParentPermission = exports.hasStackPermission = exports.hasEventPermissionForSomeStatus = exports.hasEventPermission = exports.hasPermission = exports.forbiddenRoute = void 0;
const forbiddenRoute_1 = __importDefault(require("./forbiddenRoute"));
exports.forbiddenRoute = forbiddenRoute_1.default;
const hasPermission_1 = __importDefault(require("./hasPermission"));
exports.hasPermission = hasPermission_1.default;
const hasEventPermission_1 = __importDefault(require("./hasEventPermission"));
exports.hasEventPermission = hasEventPermission_1.default;
const hasEventPermissionForSomeStatus_1 = __importDefault(require("./hasEventPermissionForSomeStatus"));
exports.hasEventPermissionForSomeStatus = hasEventPermissionForSomeStatus_1.default;
const hasStackPermission_1 = __importDefault(require("./hasStackPermission"));
exports.hasStackPermission = hasStackPermission_1.default;
const hasTagParentPermission_1 = __importDefault(require("./hasTagParentPermission"));
exports.hasTagParentPermission = hasTagParentPermission_1.default;
const hasTagPermission_1 = __importDefault(require("./hasTagPermission"));
exports.hasTagPermission = hasTagPermission_1.default;
const isAdmin_1 = __importDefault(require("./isAdmin"));
exports.isAdmin = isAdmin_1.default;
const isLoggedIn_1 = __importDefault(require("./isLoggedIn"));
exports.isLoggedIn = isLoggedIn_1.default;
const isManager_1 = __importDefault(require("./isManager"));
exports.isManager = isManager_1.default;
const isEditor_1 = __importDefault(require("./isEditor"));
exports.isEditor = isEditor_1.default;
const sessionAuth_1 = __importDefault(require("./sessionAuth"));
exports.sessionAuth = sessionAuth_1.default;
const uploadFile_1 = __importDefault(require("./uploadFile"));
exports.uploadFile = uploadFile_1.default;
const hasRolePermission_1 = __importDefault(require("./hasRolePermission"));
exports.hasRolePermission = hasRolePermission_1.default;
exports.default = {
    forbiddenRoute: forbiddenRoute_1.default,
    hasPermission: hasPermission_1.default,
    hasEventPermission: hasEventPermission_1.default,
    hasEventPermissionForSomeStatus: hasEventPermissionForSomeStatus_1.default,
    hasStackPermission: hasStackPermission_1.default,
    hasTagParentPermission: hasTagParentPermission_1.default,
    hasTagPermission: hasTagPermission_1.default,
    isAdmin: isAdmin_1.default,
    isLoggedIn: isLoggedIn_1.default,
    isManager: isManager_1.default,
    isEditor: isEditor_1.default,
    sessionAuth: sessionAuth_1.default,
    uploadFile: uploadFile_1.default,
    hasRolePermission: hasRolePermission_1.default,
};

//# sourceMappingURL=index.js.map

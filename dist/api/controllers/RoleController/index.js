"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientPermission = exports.updateClientRole = exports.checkPermissionOnResource = exports.getClientRoles = void 0;
const getClientRoles_1 = __importDefault(require("./getClientRoles"));
exports.getClientRoles = getClientRoles_1.default;
const checkPermissionOnResource_1 = __importDefault(require("./checkPermissionOnResource"));
exports.checkPermissionOnResource = checkPermissionOnResource_1.default;
const updateClientRole_1 = __importDefault(require("./updateClientRole"));
exports.updateClientRole = updateClientRole_1.default;
const updateClientPermission_1 = __importDefault(require("./updateClientPermission"));
exports.updateClientPermission = updateClientPermission_1.default;

//# sourceMappingURL=index.js.map

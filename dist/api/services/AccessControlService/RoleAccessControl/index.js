"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClientEditor = exports.isClientManager = exports.isClientAdmin = exports.allowClientToEditRole = void 0;
const allowClientToEditRole_1 = __importDefault(require("./allowClientToEditRole"));
exports.allowClientToEditRole = allowClientToEditRole_1.default;
const isClientAdmin_1 = __importDefault(require("./isClientAdmin"));
exports.isClientAdmin = isClientAdmin_1.default;
const isClientManager_1 = __importDefault(require("./isClientManager"));
exports.isClientManager = isClientManager_1.default;
const isClientEditor_1 = __importDefault(require("./isClientEditor"));
exports.isClientEditor = isClientEditor_1.default;
__exportStar(require("./getRoleRoles"), exports);

//# sourceMappingURL=index.js.map

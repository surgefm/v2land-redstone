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
exports.roles = exports.initialize = exports.acl = void 0;
const acl_1 = __importDefault(require("./acl"));
exports.acl = acl_1.default;
const initialize_1 = __importDefault(require("./initialize"));
exports.initialize = initialize_1.default;
const roles_1 = __importDefault(require("./roles"));
exports.roles = roles_1.default;
__exportStar(require("./ChatAccessControl"), exports);
__exportStar(require("./EventAccessControl"), exports);
__exportStar(require("./NewsAccessControl"), exports);
__exportStar(require("./RoleAccessControl"), exports);
__exportStar(require("./TagAccessControl"), exports);
__exportStar(require("./operations"), exports);

//# sourceMappingURL=index.js.map

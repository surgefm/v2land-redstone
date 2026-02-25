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
exports.setClientEventOwner = exports.isAllowedToViewEvent = exports.isAllowedToManageEvent = exports.isAllowedToEditEvent = exports.getEventRoleClients = exports.getEventClients = exports.getClientEventRole = exports.disallowClientToManageEvent = exports.disallowClientToEditEvent = exports.disallowClientToViewEvent = exports.allowClientToManageEvent = exports.allowClientToEditEvent = exports.allowClientToViewEvent = void 0;
const allowClientToViewEvent_1 = __importDefault(require("./allowClientToViewEvent"));
exports.allowClientToViewEvent = allowClientToViewEvent_1.default;
const allowClientToEditEvent_1 = __importDefault(require("./allowClientToEditEvent"));
exports.allowClientToEditEvent = allowClientToEditEvent_1.default;
const allowClientToManageEvent_1 = __importDefault(require("./allowClientToManageEvent"));
exports.allowClientToManageEvent = allowClientToManageEvent_1.default;
const disallowClientToViewEvent_1 = __importDefault(require("./disallowClientToViewEvent"));
exports.disallowClientToViewEvent = disallowClientToViewEvent_1.default;
const disallowClientToEditEvent_1 = __importDefault(require("./disallowClientToEditEvent"));
exports.disallowClientToEditEvent = disallowClientToEditEvent_1.default;
const disallowClientToManageEvent_1 = __importDefault(require("./disallowClientToManageEvent"));
exports.disallowClientToManageEvent = disallowClientToManageEvent_1.default;
const getClientEventRole_1 = __importDefault(require("./getClientEventRole"));
exports.getClientEventRole = getClientEventRole_1.default;
const getEventClients_1 = __importDefault(require("./getEventClients"));
exports.getEventClients = getEventClients_1.default;
const getEventRoleClients_1 = __importDefault(require("./getEventRoleClients"));
exports.getEventRoleClients = getEventRoleClients_1.default;
const isAllowedToEditEvent_1 = __importDefault(require("./isAllowedToEditEvent"));
exports.isAllowedToEditEvent = isAllowedToEditEvent_1.default;
const isAllowedToManageEvent_1 = __importDefault(require("./isAllowedToManageEvent"));
exports.isAllowedToManageEvent = isAllowedToManageEvent_1.default;
const isAllowedToViewEvent_1 = __importDefault(require("./isAllowedToViewEvent"));
exports.isAllowedToViewEvent = isAllowedToViewEvent_1.default;
const setClientEventOwner_1 = __importDefault(require("./setClientEventOwner"));
exports.setClientEventOwner = setClientEventOwner_1.default;
__exportStar(require("./getEventRoles"), exports);

//# sourceMappingURL=index.js.map

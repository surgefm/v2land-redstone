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
const operations_1 = require("@Services/AccessControlService/operations");
const getEventRoles_1 = require("./getEventRoles");
const isAllowedToManageEvent_1 = __importDefault(require("./isAllowedToManageEvent"));
const isAllowedToEditEvent_1 = __importDefault(require("./isAllowedToEditEvent"));
const isAllowedToViewEvent_1 = __importDefault(require("./isAllowedToViewEvent"));
function getClientEventRole(clientId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, operations_1.hasRole)(clientId, (0, getEventRoles_1.getEventOwnerRolePlain)(eventId)))
            return 'owner';
        if (yield (0, isAllowedToManageEvent_1.default)(clientId, eventId))
            return 'manager';
        if (yield (0, isAllowedToEditEvent_1.default)(clientId, eventId))
            return 'editor';
        if (yield (0, isAllowedToViewEvent_1.default)(clientId, eventId))
            return 'viewer';
        return 'passerby';
    });
}
exports.default = getClientEventRole;

//# sourceMappingURL=getClientEventRole.js.map

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
const operations_1 = require("@Services/AccessControlService/operations");
const RoleAccessControl_1 = require("@Services/AccessControlService/RoleAccessControl");
const getEventRoles_1 = require("./getEventRoles");
function isAllowedToEditEvent(clientId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield (0, operations_1.isAllowed)(clientId, (0, getEventRoles_1.getEventResourceId)(eventId), 'edit')) ||
            (yield (0, RoleAccessControl_1.isClientEditor)(clientId));
    });
}
exports.default = isAllowedToEditEvent;

//# sourceMappingURL=isAllowedToEditEvent.js.map

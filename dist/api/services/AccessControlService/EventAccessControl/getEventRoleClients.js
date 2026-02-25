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
const getEventRoles_1 = require("./getEventRoles");
function getEventRoleClients(eventId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (role) {
            case 'owner':
                return (yield (0, operations_1.roleUsers)((0, getEventRoles_1.getEventOwnerRolePlain)(eventId))).map(i => +i);
            case 'manager':
                return (yield (0, operations_1.roleUsers)((0, getEventRoles_1.getEventManageRolePlain)(eventId))).map(i => +i);
            case 'editor':
                return (yield (0, operations_1.roleUsers)((0, getEventRoles_1.getEventEditRolePlain)(eventId))).map(i => +i);
            case 'viewer':
                return (yield (0, operations_1.roleUsers)((0, getEventRoles_1.getEventViewRolePlain)(eventId))).map(i => +i);
            default:
                return [];
        }
    });
}
exports.default = getEventRoleClients;

//# sourceMappingURL=getEventRoleClients.js.map

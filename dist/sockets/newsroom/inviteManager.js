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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const operations_1 = require("@Services/AccessControlService/operations");
const getRoomName_1 = __importDefault(require("./getRoomName"));
function inviteManager(socket) {
    socket.on('invite manager', (eventId, clientId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        const ownerId = socket.handshake.session.clientId;
        const haveAccess = yield (0, operations_1.hasRole)(ownerId, _Services_1.AccessControlService.getEventOwnerRolePlain(eventId));
        if (!haveAccess)
            return cb('You are not allowed to invate managers to this event.');
        const event = yield _Models_1.Event.findByPk(eventId);
        if (!event)
            return cb('Event not found');
        const client = yield _Models_1.Client.findByPk(clientId);
        if (!client)
            return cb('Client not found');
        yield _Services_1.AccessControlService.allowClientToManageEvent(clientId, eventId);
        socket.in((0, getRoomName_1.default)(eventId)).emit('add manager', { eventId, clientId });
        cb();
    }));
}
exports.default = inviteManager;

//# sourceMappingURL=inviteManager.js.map

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
const RoleAccessControl_1 = require("@Services/AccessControlService/RoleAccessControl");
const getRoomName_1 = __importDefault(require("./getRoomName"));
function updateEvent(socket) {
    socket.on('update event information', (eventId, data, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        const { clientId } = socket.handshake.session;
        const haveAccess = yield _Services_1.AccessControlService.isAllowedToEditEvent(clientId, eventId);
        if (!haveAccess)
            return cb('You are not allowed to edit this event.');
        const event = yield _Services_1.EventService.findEvent(eventId, { eventOnly: true });
        if (!event)
            return cb('Event not found');
        // Status change permission logic:
        // - Global admins (editors): can set admitted/hidden/removed from any state
        // - Event owners: can set admitted/hidden, but NOT removed; cannot change if already removed
        if (data.status) {
            const isAdmin = yield (0, RoleAccessControl_1.isClientEditor)(clientId);
            if (isAdmin) {
                // Admin can set any status — no restrictions
            }
            else if (event.ownerId === clientId) {
                if (event.status === 'removed') {
                    // Owner cannot change status once removed
                    delete data.status;
                }
                else if (data.status === 'removed') {
                    // Owner cannot set status to removed
                    delete data.status;
                }
            }
            else {
                // Other roles cannot change status
                delete data.status;
            }
        }
        try {
            const e = yield _Services_1.EventService.updateEvent(event, data, yield _Models_1.Client.findByPk(clientId));
            const { id, name, description, status, needContributor } = e;
            if (e !== null) {
                socket.to((0, getRoomName_1.default)(eventId)).emit('update event information', { event: { id, name, description, status, needContributor } });
            }
            cb();
        }
        catch (err) {
            cb(err.message);
        }
    }));
}
exports.default = updateEvent;

//# sourceMappingURL=updateEvent.js.map

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
const _Services_1 = require("@Services");
const getRoomName_1 = __importDefault(require("./getRoomName"));
function unlockResource(socket) {
    socket.on('unlock resource', (eventId, model, resourceId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        const { clientId } = socket.handshake.session;
        const haveAccess = yield _Services_1.AccessControlService.isAllowedToEditEvent(clientId, eventId);
        if (!haveAccess)
            return cb('You are not allowed to edit this event.');
        const unlocked = yield _Services_1.ResourceLockService.unlock(model, resourceId, clientId, eventId);
        if (!unlocked) {
            return cb('You can’t unlock this resource.');
        }
        socket.in((0, getRoomName_1.default)(eventId)).emit('unlock resource', {
            eventId,
            model,
            resourceId,
            locker: clientId,
        });
        cb();
    }));
}
exports.default = unlockResource;

//# sourceMappingURL=unlockResource.js.map

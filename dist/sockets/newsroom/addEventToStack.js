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
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function addEventToStack(socket) {
    socket.on('add event to stack', (eventId, stackId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        const { clientId } = socket.handshake.session;
        const stack = yield _Models_1.Stack.findByPk(stackId);
        if (!stack)
            return cb('Stack not found');
        const haveAccess = yield _Services_1.AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
        if (!haveAccess)
            return cb('You are not allowed to edit this event.');
        const event = yield _Models_1.Event.findByPk(eventId);
        if (!event)
            return cb('Event not found');
        try {
            yield _Services_1.StackService.addEvent(stackId, eventId, clientId);
            cb();
        }
        catch (err) {
            cb(err.message);
        }
    }));
}
exports.default = addEventToStack;

//# sourceMappingURL=addEventToStack.js.map

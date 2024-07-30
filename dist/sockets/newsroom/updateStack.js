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
const _Models_1 = require("@Models");
const getRoomName_1 = __importDefault(require("./getRoomName"));
function updateStack(socket) {
    socket.on('update stack', (stackId, data, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        const { clientId } = socket.handshake.session;
        const stack = yield _Models_1.Stack.findByPk(stackId);
        if (!stack)
            return cb('Stack not found');
        const haveAccess = yield _Services_1.AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
        if (!haveAccess)
            return cb('You are not allowed to edit this event.');
        try {
            const returnValue = yield _Services_1.StackService.updateStack({
                id: stackId,
                data,
                clientId,
            });
            if (returnValue.status === 201) {
                socket.to((0, getRoomName_1.default)(returnValue.message.stack.eventId)).emit('update stack', returnValue.message);
            }
            cb();
        }
        catch (err) {
            cb(err.message);
        }
    }));
}
exports.default = updateStack;

//# sourceMappingURL=updateStack.js.map

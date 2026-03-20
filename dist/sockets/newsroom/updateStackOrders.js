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
const lodash_1 = __importDefault(require("lodash"));
const _Services_1 = require("@Services");
const getRoomName_1 = __importDefault(require("./getRoomName"));
function updateStackOrders(socket) {
    socket.on('update stack orders', (eventId, stacks, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
        if (!lodash_1.default.isArray(stacks)) {
            return cb('Invalid input：stacks');
        }
        const { clientId } = socket.handshake.session;
        const haveAccess = yield _Services_1.AccessControlService.isAllowedToEditEvent(clientId, eventId);
        if (!haveAccess)
            return cb('You are not allowed to edit this event.');
        for (const { stackId } of stacks) {
            const stack = yield _Models_1.Stack.findByPk(stackId, { attributes: ['eventId'] });
            if (stack.eventId !== eventId) {
                return cb('The stacks need to belong to the same event');
            }
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const queue = stacks.map(({ stackId, order }) => _Services_1.StackService.updateStack({
                id: stackId,
                data: { order },
                clientId,
                transaction,
            }));
            yield Promise.all(queue);
            yield _Services_1.RecordService.update({
                model: 'Event',
                target: eventId,
                owner: clientId,
                action: 'updateStackOrders',
            }, { transaction });
            socket.in((0, getRoomName_1.default)(eventId)).emit('update stack orders', {
                eventId,
                stacks,
            });
            cb();
        }));
    }));
}
exports.default = updateStackOrders;

//# sourceMappingURL=updateStackOrders.js.map

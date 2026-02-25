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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const _Types_1 = require("@Types");
const RecordService = __importStar(require("@Services/RecordService"));
function addEvent(stackId, eventId, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const stack = yield _Models_1.Stack.findByPk(stackId);
        if (!stack) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, '无法找到该进展');
        }
        const event = yield _Models_1.Event.findByPk(eventId);
        if (!event) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, '无法找到该事件');
        }
        if (stack.eventId === event.id)
            return null;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const time = new Date();
            const options = {
                model: 'Stack',
                data: { stackEventId: event.id },
                target: stack.id,
                subtarget: event.id,
                owner: clientId,
                createdAt: time,
                updatedAt: time,
            };
            if (stack.stackEventId) {
                yield RecordService.update(Object.assign({ before: { stackEventId: stack.stackEventId }, action: 'updateStackEvent' }, options), { transaction });
            }
            else {
                yield RecordService.create(Object.assign({ action: 'addEventToStack' }, options), { transaction });
            }
            stack.stackEventId = event.id;
            yield stack.save({ transaction });
        }));
        return stack;
    });
}
exports.default = addEvent;

//# sourceMappingURL=addEvent.js.map

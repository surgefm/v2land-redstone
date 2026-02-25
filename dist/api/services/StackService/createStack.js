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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const EventService = __importStar(require("@Services/EventService"));
const RecordService = __importStar(require("@Services/RecordService"));
const UtilService = __importStar(require("@Services/UtilService"));
const updateElasticsearchIndex_1 = __importDefault(require("./updateElasticsearchIndex"));
function createStack(eventId, data, clientId, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, description, order, time, stackEventId } = data;
        if (!title) {
            throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '缺少参数：title');
        }
        const event = yield EventService.findEvent(eventId);
        if (!event) {
            throw new _Types_1.RedstoneError(_Types_1.ResourceNotFoundErrorType, '未找到该事件');
        }
        let stack = null;
        yield UtilService.execWithTransaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            stack = yield _Models_1.Stack.findOne({
                where: { eventId, title },
                transaction,
            });
            if (stack) {
                throw new _Types_1.RedstoneError(_Types_1.InvalidInputErrorType, '该事件下已存在同名进展');
            }
            const data = {
                status: 'admitted',
                title,
                description,
                order: order || -1,
                eventId: event.id,
                stackEventId,
                time,
            };
            stack = yield _Models_1.Stack.create(data, { transaction });
            yield RecordService.create({
                model: 'stack',
                data,
                target: stack.id,
                subtarget: stack.eventId,
                owner: clientId,
                action: 'createStack',
            }, { transaction });
        }), transaction);
        const socket = yield EventService.getNewsroomSocket(stack.eventId);
        socket.emit('add event to stack', {
            eventId,
            stackId: stack.id,
            client: yield _Models_1.Client.findByPk(clientId),
        });
        socket.emit('create stack', { stack });
        (0, updateElasticsearchIndex_1.default)({ stackId: stack.id });
        return stack;
    });
}
exports.default = createStack;

//# sourceMappingURL=createStack.js.map

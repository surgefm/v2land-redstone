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
exports.readMessage = void 0;
const v4_1 = __importDefault(require("uuid/v4"));
const _Models_1 = require("@Models");
const utils_1 = require("./utils");
const readMessage = (clientId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield _Models_1.ChatMessage.findByPk(messageId);
    if (!message)
        return;
    const data = {
        chatId: message.chatId,
        clientId,
    };
    let chatMember = yield _Models_1.ChatMember.findOne({ where: data });
    if (!chatMember) {
        chatMember = yield _Models_1.ChatMember.create(Object.assign({ id: (0, v4_1.default)() }, data));
    }
    if (!chatMember.lastRead || chatMember.lastRead < message.createdAt) {
        chatMember.lastRead = message.createdAt;
        yield chatMember.save();
        const socket = yield (0, utils_1.getChatSocket)(message.chatId);
        socket.emit('client read', message.chatId, clientId, message.createdAt);
    }
});
exports.readMessage = readMessage;

//# sourceMappingURL=readMessage.js.map

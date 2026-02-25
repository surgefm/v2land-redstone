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
exports.revealChatroom = exports.getChatSocket = exports.getOrCreateChat = exports.getChat = exports.getChatId = exports.getClientChatId = exports.getNewsroomChatId = void 0;
const v4_1 = __importDefault(require("uuid/v4"));
const _Models_1 = require("@Models");
const chatroomPath_1 = __importDefault(require("@Sockets/chatroom/chatroomPath"));
const getNewsroomChatId = (eventId) => {
    return `chat-newsroom:${eventId}`;
};
exports.getNewsroomChatId = getNewsroomChatId;
const getClientChatId = (...clientIds) => {
    const ids = [...new Set(clientIds).values()].sort();
    return `chat-clients:${ids.join('-')}`;
};
exports.getClientChatId = getClientChatId;
const getChatId = (type, ids) => {
    if (type === 'client')
        return (0, exports.getClientChatId)(...ids);
    return (0, exports.getNewsroomChatId)(ids);
};
exports.getChatId = getChatId;
function getChat(type, ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (type === 'client') {
            return _Models_1.Chat.findByPk((0, exports.getClientChatId)(...ids));
        }
        return _Models_1.Chat.findByPk((0, exports.getNewsroomChatId)(ids));
    });
}
exports.getChat = getChat;
function getOrCreateChat(type, ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (type === 'client') {
            const _ids = ids;
            const clientChatId = (0, exports.getClientChatId)(..._ids);
            const exist = yield _Models_1.Chat.findByPk(clientChatId);
            if (exist)
                return exist;
            const newChat = yield _Models_1.Chat.create({
                id: clientChatId,
            });
            yield Promise.all(_ids.map(id => _Models_1.ChatMember.create({
                id: (0, v4_1.default)(),
                chatId: clientChatId,
                clientId: id,
            })));
            return newChat;
        }
        else if (type === 'newsroom') {
            const eventId = ids;
            const newsroomChatId = (0, exports.getNewsroomChatId)(eventId);
            const exist = yield _Models_1.Chat.findByPk(newsroomChatId);
            if (exist)
                return exist;
            return _Models_1.Chat.create({
                id: newsroomChatId,
                eventId,
            });
        }
    });
}
exports.getOrCreateChat = getOrCreateChat;
function getChatSocket(type, ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const { loadSocket } = yield Promise.resolve().then(() => __importStar(require('@Sockets')));
        const server = yield loadSocket();
        if (type === 'client') {
            return server.of(chatroomPath_1.default).in((0, exports.getClientChatId)(...ids));
        }
        else if (type === 'newsroom') {
            return server.of(chatroomPath_1.default).in((0, exports.getNewsroomChatId)(ids));
        }
        return server.of(chatroomPath_1.default).in(type);
    });
}
exports.getChatSocket = getChatSocket;
function revealChatroom(chatId) {
    const [typeStr, idStr] = chatId.split(':');
    return [
        typeStr === 'chat-newsroom' ? 'newsroom' : 'client',
        typeStr === 'chat-newsroom' ? +idStr : +idStr.split('-').map(s => +s),
    ];
}
exports.revealChatroom = revealChatroom;

//# sourceMappingURL=utils.js.map

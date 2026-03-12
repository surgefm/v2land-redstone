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
const ChatService = __importStar(require("@Services/ChatService"));
const AccessControlService = __importStar(require("@Services/AccessControlService"));
const middlewares_1 = require("@Sockets/middlewares");
const chatroomPath_1 = __importDefault(require("./chatroomPath"));
const wrapSocket_1 = __importDefault(require("../wrapSocket"));
const BOT_MENTION_PATTERN = /@bot\b/i;
function loadChatroom(io) {
    const newsroom = io.of(chatroomPath_1.default);
    newsroom.use(middlewares_1.isLoggedIn);
    newsroom.on('connection', (rawSocket) => {
        const socket = (0, wrapSocket_1.default)(rawSocket);
        socket.on('join chatroom', (type, ids, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
            const { clientId } = socket.handshake.session;
            const hasAccess = type === 'client'
                ? yield AccessControlService.isAllowedToViewClientChat(clientId, ids)
                : yield AccessControlService.isAllowedToViewNewsroomChat(clientId, ids);
            if (!hasAccess) {
                return cb('You don\'t have access to the chatroom');
            }
            const roomName = ChatService.getChatId(type, ids);
            yield socket.join(roomName);
            cb(null, {
                messages: yield ChatService.loadMessages(type, ids),
                members: yield ChatService.getChatMembers(type, ids),
            });
        }));
        socket.on('send message', (type, ids, message, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
            const { clientId } = socket.handshake.session;
            const hasAccess = type === 'client'
                ? yield AccessControlService.isAllowedToTalkTo(clientId, ids)
                : yield AccessControlService.isAllowedToChatInNewsroom(clientId, ids);
            if (!hasAccess) {
                return cb('You have no access to the chatroom');
            }
            yield ChatService.sendMessage(type, clientId, message, ids);
            cb();
            // Detect @Bot mention in newsroom chats and trigger agent
            if (type === 'newsroom' && BOT_MENTION_PATTERN.test(message)) {
                handleBotMention(clientId, ids, message);
            }
        }));
        socket.on('read message', (messageId, cb = () => { }) => __awaiter(this, void 0, void 0, function* () {
            const { clientId } = socket.handshake.session;
            yield ChatService.readMessage(clientId, messageId);
            cb();
        }));
    });
}
exports.default = loadChatroom;
function handleBotMention(clientId, eventId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Only editors can instruct the bot
            const canEdit = yield AccessControlService.isAllowedToEditEvent(clientId, eventId);
            if (!canEdit)
                return;
            const { AgentLock, run } = yield Promise.resolve().then(() => __importStar(require('@Services/AgentService')));
            const locked = yield AgentLock.isLocked(eventId);
            if (locked) {
                // Agent already running — push as mid-run correction
                yield AgentLock.pushToInbox(eventId, message);
            }
            else {
                // Start a new agent run
                run(eventId, message).catch((err) => {
                    console.error(`[Chatroom] Agent run error for event ${eventId}:`, err);
                });
            }
        }
        catch (err) {
            console.error(`[Chatroom] Error handling @Bot mention:`, err);
        }
    });
}

//# sourceMappingURL=index.js.map

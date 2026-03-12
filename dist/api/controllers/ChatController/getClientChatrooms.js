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
const _Services_1 = require("@Services");
const _Models_1 = require("@Models");
function getChatroomInfo(chatId, clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatMember = yield _Models_1.ChatMember.findOne({
            where: {
                chatId,
                clientId,
                lastSpoke: {
                    [_Models_1.Sequelize.Op.ne]: null,
                },
            },
        });
        if (!chatMember)
            return;
        const [type, ids] = _Services_1.ChatService.revealChatroom(chatId);
        const key = `chatroom-info-${_Services_1.ChatService.getChatId(type, ids)}`;
        let chat = yield _Services_1.RedisService.get(key);
        if (!chat) {
            chat = (yield _Models_1.Chat.findByPk(chatId)).get({ plain: true });
            const within = new Date(Date.now() - 30 * 60 * 1000);
            if (type === 'newsroom') {
                const eventId = ids;
                chat.event = yield _Models_1.Event.findByPk(eventId);
                const owner = yield _Services_1.ClientService.findClient(chat.event.ownerId, {
                    withAuths: false,
                    withSubscriptions: false,
                });
                chat.eventOwner = _Services_1.ClientService.sanitizeClient(owner);
                const records = yield _Models_1.sequelize.query(`
        SELECT *
          FROM record
          WHERE (action IN ('createStack', 'addNewsToStack') AND data->>'eventId' = '${eventId}')
          OR (action IN ('makeCommitForEvent', 'updateStackOrders', 'addNewsToEvent', 'createEvent') AND target = ${eventId})
          ORDER BY "createdAt" DESC
          LIMIT 100
      `, {
                    type: _Models_1.Sequelize.QueryTypes.SELECT,
                });
                chat.editorIds = Array.from(new Set(records.map(r => r.owner).filter(c => c)));
                chat.editorIdsNow = Array.from(new Set(records.filter(r => r.createdAt >= within && r.owner).map(r => r.owner)));
            }
            const messages = yield _Models_1.ChatMessage.findAll({
                where: { chatId },
                order: [['createdAt', 'DESC']],
                limit: 50,
            });
            chat.speakerIds = Array.from(new Set(messages.map(m => m.authorId)));
            chat.speakerIdsNow = Array.from(new Set(messages.filter(m => m.createdAt >= within).map(m => m.authorId)));
            const chatterSocket = yield _Services_1.ChatService.getChatSocket(chatId);
            let sockets = [];
            try {
                sockets = yield chatterSocket.fetchSockets();
            }
            catch (err) {
                // Do nothing
            }
            const clientIds = yield Promise.all(sockets.map(socket => {
                return _Services_1.RedisService.get(`socket:${socket.id}`);
            }));
            chat.chatterIds = [...new Set(clientIds)];
            yield _Services_1.RedisService.set(key, chat);
            yield _Services_1.RedisService.expire(key, 60);
        }
        chat.unreadMessagesCount = chatMember.lastRead ? yield _Models_1.ChatMessage.count({
            where: {
                chatId,
                createdAt: {
                    [_Models_1.Sequelize.Op.gt]: chatMember.lastRead,
                },
            },
        }) : 0;
        return chat;
    });
}
function getClientChatrooms(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `client-chatrooms-60-${req.session.clientId}`;
        const existing = yield _Services_1.RedisService.get(key);
        if (existing) {
            return res.status(200).json({
                chatrooms: (yield Promise.all(existing.map((c) => getChatroomInfo(c, req.session.clientId)))).filter(c => c),
            });
        }
        const chatIds = new Set();
        const recentMessageSql = `
    SELECT DISTINCT(A."chatId")
    FROM (
      SELECT "chatId", "createdAt"
      FROM "chatMessage"
      WHERE "authorId" = ${req.session.clientId}
      ORDER BY "createdAt" DESC
    ) as A
    LIMIT 10  
  `;
        const messages = yield _Models_1.sequelize.query(recentMessageSql, {
            type: _Models_1.Sequelize.QueryTypes.SELECT,
        });
        for (const message of messages) {
            chatIds.add(message.chatId);
        }
        const recordsQuery = {
            action: {
                [_Models_1.Sequelize.Op.or]: [
                    'createStack',
                    'addNewsToStack',
                    'addNewsToEvent',
                    'updateStackOrders',
                    'makeCommitForEvent',
                ],
            },
            owner: req.session.clientId,
        };
        const twoDays = new Date(Date.now() - 48 * 60 * 60 * 1000);
        let records = yield _Models_1.Record.findAll({
            where: Object.assign(Object.assign({}, recordsQuery), { createdAt: {
                    [_Models_1.Sequelize.Op.gte]: twoDays,
                } }),
            order: [['createdAt', 'DESC']],
            limit: 500,
        });
        if (records.length < 100) {
            const recordsB = yield _Models_1.Record.findAll({
                where: Object.assign(Object.assign({}, recordsQuery), { createdAt: {
                        [_Models_1.Sequelize.Op.lt]: twoDays,
                    } }),
                order: [['createdAt', 'DESC']],
                limit: 100 - records.length,
            });
            records = [...records, ...recordsB];
        }
        for (const record of records) {
            switch (record.action) {
                case 'createStack':
                    chatIds.add(_Services_1.ChatService.getChatId('newsroom', record.data.eventId));
                    break;
                case 'addNewsToStack':
                    chatIds.add(_Services_1.ChatService.getChatId('newsroom', record.data.eventId));
                    break;
                case 'makeCommitForEvent':
                case 'updateStackOrders':
                case 'addNewsToEvent':
                    chatIds.add(_Services_1.ChatService.getChatId('newsroom', record.target));
            }
        }
        const promises = Array.from(chatIds).filter(c => c).map(c => getChatroomInfo(c, req.session.clientId));
        const chats = (yield Promise.all(promises)).filter(c => c);
        yield _Services_1.RedisService.set(key, Array.from(chatIds));
        yield _Services_1.RedisService.expire(key, 60);
        res.status(200).json({ chatrooms: chats });
    });
}
exports.default = getClientChatrooms;

//# sourceMappingURL=getClientChatrooms.js.map

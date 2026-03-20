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
function getPopularChatrooms(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = 'popular-chatrooms-60';
        const existing = yield _Services_1.RedisService.get(key);
        if (existing)
            return res.status(200).json({ chatrooms: existing });
        const pageSize = 200;
        let messages = [];
        const eventEdits = {};
        const eventMessages = {};
        const eventIds = new Set();
        const events = {};
        let edits = [];
        let chats = [];
        let page = 0;
        const firstMessageSql = `
    SELECT * FROM "chatMessage"
    WHERE "chatId" LIKE 'chat-newsroom%' AND "createdAt" >= $1
    ORDER BY "createdAt" DESC
  `;
        const messageSql = `
    SELECT * FROM "chatMessage"
    WHERE "chatId" LIKE 'chat-newsroom%' AND "createdAt" < $1
    ORDER BY "createdAt" DESC
    LIMIT ${pageSize}
  `;
        let count = 0;
        let i = 0;
        let j = 0;
        while (chats.filter(c => c.count > 0).length < 10) {
            let moreMessages;
            if (page === 0) {
                moreMessages = yield _Models_1.sequelize.query(firstMessageSql, {
                    type: _Models_1.Sequelize.QueryTypes.SELECT,
                    bind: [new Date(Date.now() - 12 * 60 * 60 * 1000)],
                });
            }
            else {
                moreMessages = yield _Models_1.sequelize.query(messageSql, {
                    type: _Models_1.Sequelize.QueryTypes.SELECT,
                    bind: [messages.length === 0 ? new Date() : messages[messages.length - 1].createdAt],
                });
            }
            messages = [...messages, ...moreMessages];
            const records = yield _Models_1.Record.findAll({
                where: {
                    action: {
                        [_Models_1.Sequelize.Op.or]: [
                            'createStack',
                            'addNewsToStack',
                            'addNewsToEvent',
                            'updateStackOrders',
                            'makeCommitForEvent',
                        ],
                    },
                    createdAt: page === 0 ? {
                        [_Models_1.Sequelize.Op.gte]: new Date(Date.now() - 12 * 60 * 60 * 1000),
                    } : {
                        [_Models_1.Sequelize.Op.lt]: edits.length > 0 ? edits[edits.length - 1].createdAt : Date.now(),
                    },
                },
                order: [['createdAt', 'DESC']],
                limit: page === 0 ? undefined : pageSize,
            });
            edits = [...edits, ...records];
            if (page !== 0 && moreMessages.length === 0 && records.length === 0)
                break;
            page += 1;
            let latest = new Date();
            while (count < page * pageSize && (i < messages.length - 1 || j < edits.length - 1)) {
                if (i >= messages.length - 1) {
                    j += 1;
                    latest = edits[j].createdAt;
                }
                else if (j >= edits.length - 1) {
                    i += 1;
                    latest = messages[i].createdAt;
                }
                else if (messages[i].createdAt < edits[j].createdAt) {
                    i += 1;
                    latest = messages[i].createdAt;
                }
                else {
                    j += 1;
                    latest = edits[j].createdAt;
                }
                count += 1;
            }
            const addEventEdit = (eventId, record) => {
                if (!eventEdits[eventId])
                    eventEdits[eventId] = [];
                eventEdits[eventId].push(record);
                eventIds.add(eventId);
            };
            for (const record of records) {
                switch (record.action) {
                    case 'createStack':
                        addEventEdit(record.data.eventId, record);
                        break;
                    case 'addNewsToStack':
                        addEventEdit(record.data.eventId, record);
                        break;
                    case 'makeCommitForEvent':
                    case 'updateStackOrders':
                    case 'addNewsToEvent':
                        addEventEdit(record.target, record);
                }
            }
            for (const message of moreMessages) {
                const eventId = +message.chatId.slice('chat-newsroom:'.length);
                if (!eventMessages[eventId])
                    eventMessages[eventId] = [];
                eventMessages[eventId].push(message);
                eventIds.add(eventId);
            }
            const within = new Date(Date.now() - 30 * 60 * 1000).toISOString();
            const withinDate = new Date(within);
            chats = [];
            yield Promise.all([...eventIds].map((eventId) => __awaiter(this, void 0, void 0, function* () {
                if (!events[eventId]) {
                    events[eventId] = yield _Services_1.EventService.findEvent(eventId, { plain: true, eventOnly: true });
                }
                const event = events[eventId];
                if (event.status !== 'admitted')
                    return;
                const eventRecords = (eventEdits[eventId] || []).filter((r, idx) => {
                    if (r.createdAt < latest)
                        return false;
                    if (idx === 0)
                        return true;
                    return !(r.action === 'updateStackOrders' &&
                        eventEdits[eventId][idx - 1].action === 'updateStackOrders');
                });
                const chatId = _Services_1.ChatService.getChatId('newsroom', +eventId);
                const eventMessage = (eventMessages[eventId] || [])
                    .filter(m => m.createdAt >= latest);
                if (eventRecords.length === 0 && eventMessage.length === 0)
                    return;
                chats.push({
                    eventId: +eventId,
                    event,
                    id: chatId,
                    chatId,
                    count: eventRecords.length + eventMessage.length,
                    updatedAt: eventRecords.length > 0 ? eventRecords[0].createdAt : event.updatedAt,
                    editorIds: eventRecords.map(r => r.owner),
                    editorIdsNow: eventRecords.filter(r => r.createdAt >= withinDate).map(r => r.owner),
                    speakerIds: eventMessage.map(m => m.authorId),
                    speakerIdsNow: eventMessage.filter(m => m.createdAt >= withinDate).map(m => m.authorId),
                });
            })));
            chats.sort((a, b) => b.count - a.count);
            chats = chats.slice(0, 10);
        }
        yield Promise.all(chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
            const owner = yield _Services_1.ClientService.findClient(chat.event.ownerId, {
                withAuths: false,
                withSubscriptions: false,
            });
            chat.eventOwner = _Services_1.ClientService.sanitizeClient(owner);
            const editorIds = [];
            for (let i = 0; i < chat.editorIds.length; i++) {
                if (!editorIds.includes(chat.editorIds[i])) {
                    editorIds.push(chat.editorIds[i]);
                }
            }
            const speakerIds = [];
            for (let i = 0; i < chat.speakerIds.length; i++) {
                if (!speakerIds.includes(chat.speakerIds[i])) {
                    speakerIds.push(chat.speakerIds[i]);
                }
            }
            chat.editorIds = editorIds;
            chat.speakerIds = speakerIds;
            chat.editorIdsNow = [...new Set(chat.editorIdsNow)];
            chat.speakerIdsNow = [...new Set(chat.speakerIdsNow)];
            const chatterSocket = yield _Services_1.ChatService.getChatSocket('newsroom', chat.eventId);
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
        })));
        yield _Services_1.RedisService.set(key, chats);
        yield _Services_1.RedisService.expire(key, 30);
        res.status(200).json({ chatrooms: chats });
    });
}
exports.default = getPopularChatrooms;

//# sourceMappingURL=getPopularChatrooms.js.map

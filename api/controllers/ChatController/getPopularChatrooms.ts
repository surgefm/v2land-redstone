import { RemoteSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RedstoneRequest, RedstoneResponse, SanitizedClient, EventObj } from '@Types';
import { RedisService, ChatService, ClientService, EventService } from '@Services';
import { ChatMessage, Record, EventStackNews, sequelize, Sequelize } from '@Models';

interface PopularChat {
  id: string;
  chatId: string;
  eventId: number;
  editorIds: number[];
  editorIdsNow: number[];
  speakerIds: number[];
  speakerIdsNow: number[];
  chatterIds?: number[];
  count: number;
  eventOwner?: SanitizedClient;
  updatedAt: string;
  event?: EventObj;
}

async function getPopularChatrooms(req: RedstoneRequest, res: RedstoneResponse) {
  const key = 'popular-chatrooms-60';
  const existing = await RedisService.get(key);
  if (existing) return res.status(200).json({ chatrooms: existing });

  const pageSize = 200;

  let messages: ChatMessage[] = [];
  const eventEdits: { [index: string]: Record[] } = {};
  const eventMessages: { [index: string]: ChatMessage[] } = {};
  const eventIds = new Set<number>();
  const events: { [index: string]: EventObj } = {};
  let edits: Record[] = [];
  let chats: PopularChat[] = [];
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
    let moreMessages: ChatMessage[];
    if (page === 0) {
      moreMessages = await sequelize.query<ChatMessage>(firstMessageSql, {
        type: Sequelize.QueryTypes.SELECT,
        bind: [new Date(Date.now() - 12 * 60 * 60 * 1000)],
      });
    } else {
      moreMessages = await sequelize.query<ChatMessage>(messageSql, {
        type: Sequelize.QueryTypes.SELECT,
        bind: [messages.length === 0 ? new Date() : messages[messages.length - 1].createdAt],
      });
    }
    messages = [...messages, ...moreMessages];

    const records = await Record.findAll({
      where: {
        action: {
          [Sequelize.Op.or]: [
            'createStack',
            'addNewsToStack',
            'addNewsToEvent',
            'updateStackOrders',
            'makeCommitForEvent',
          ],
        },
        createdAt: page === 0 ? {
          [Sequelize.Op.gte]: new Date(Date.now() - 12 * 60 * 60 * 1000),
        } : {
          [Sequelize.Op.lt]: edits.length > 0 ? edits[edits.length - 1].createdAt : Date.now(),
        },
      },
      order: [['createdAt', 'DESC']],
      limit: page === 0 ? undefined : pageSize,
    });

    edits = [...edits, ...records];

    if (page !== 0 && moreMessages.length === 0 && records.length === 0) break;

    page += 1;

    let latest: Date = new Date();
    while (count < page * pageSize && (i < messages.length - 1 || j < edits.length - 1)) {
      if (i >= messages.length - 1) {
        j += 1;
        latest = edits[j].createdAt;
      } else if (j >= edits.length - 1) {
        i += 1;
        latest = messages[i].createdAt;
      } else if (messages[i].createdAt < edits[j].createdAt) {
        i += 1;
        latest = messages[i].createdAt;
      } else {
        j += 1;
        latest = edits[j].createdAt;
      }

      count += 1;
    }

    const addEventEdit = (eventId: number, record: Record) => {
      if (!eventEdits[eventId]) eventEdits[eventId] = [];
      eventEdits[eventId].push(record);
      eventIds.add(eventId);
    };

    for (const record of records) {
      switch (record.action) {
      case 'createStack':
        addEventEdit(record.data.eventId, record);
        break;
      case 'addNewsToStack':
        addEventEdit((record.data as EventStackNews).eventId, record);
        break;
      case 'makeCommitForEvent':
      case 'updateStackOrders':
      case 'addNewsToEvent':
        addEventEdit(record.target, record);
      }
    }

    for (const message of moreMessages) {
      const eventId = +message.chatId.slice('chat-newsroom:'.length);
      if (!eventMessages[eventId]) eventMessages[eventId] = [];
      eventMessages[eventId].push(message);
      eventIds.add(eventId);
    }

    const within = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const withinDate = new Date(within);

    chats = [];
    await Promise.all([...eventIds].map(async eventId => {
      if (!events[eventId]) {
        events[eventId] = await EventService.findEvent(eventId, { plain: true, eventOnly: true });
      }
      const event = events[eventId];
      if (event.status !== 'admitted') return;

      const eventRecords = (eventEdits[eventId] || []).filter((r, idx) => {
        if (r.createdAt < latest) return false;
        if (idx === 0) return true;
        return !(r.action === 'updateStackOrders' &&
          eventEdits[eventId][idx - 1].action === 'updateStackOrders');
      });

      const chatId = ChatService.getChatId('newsroom', +eventId);
      const eventMessage = (eventMessages[eventId] || [])
        .filter(m => m.createdAt >= latest);

      if (eventRecords.length === 0 && eventMessage.length === 0) return;

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
    }));

    chats.sort((a, b) => b.count - a.count);
    chats = chats.slice(0, 10);
  }

  await Promise.all(chats.map(async (chat) => {
    const owner = await ClientService.findClient(chat.event.ownerId, {
      withAuths: false,
      withSubscriptions: false,
    });
    chat.eventOwner = ClientService.sanitizeClient(owner);
    const editorIds: number[] = [];
    for (let i = 0; i < chat.editorIds.length; i++) {
      if (!editorIds.includes(chat.editorIds[i])) {
        editorIds.push(chat.editorIds[i]);
      }
    }

    const speakerIds: number[] = [];
    for (let i = 0; i < chat.speakerIds.length; i++) {
      if (!speakerIds.includes(chat.speakerIds[i])) {
        speakerIds.push(chat.speakerIds[i]);
      }
    }

    chat.editorIds = editorIds;
    chat.speakerIds = speakerIds;
    chat.editorIdsNow = [...new Set(chat.editorIdsNow)];
    chat.speakerIdsNow = [...new Set(chat.speakerIdsNow)];
    const chatterSocket = await ChatService.getChatSocket('newsroom', chat.eventId);
    let sockets: RemoteSocket<DefaultEventsMap, any>[] = [];
    try {
      sockets = await chatterSocket.fetchSockets();
    } catch (err) {
      // Do nothing
    }
    const clientIds = await Promise.all(sockets.map(socket => {
      return RedisService.get(`socket:${socket.id}`);
    }));
    chat.chatterIds = [...new Set(clientIds)];
  }));

  await RedisService.set(key, chats);
  await RedisService.expire(key, 30);

  res.status(200).json({ chatrooms: chats });
}

export default getPopularChatrooms;

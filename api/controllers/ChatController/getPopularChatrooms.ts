import { RedstoneRequest, RedstoneResponse, SanitizedClient, EventObj } from '@Types';
import { RedisService, ChatService, ClientService, EventService } from '@Services';
import { ChatMessage, Record, EventStackNews, sequelize, Sequelize } from '@Models';

interface PopularChat {
  chatId: string;
  eventId: number;
  editorIds: number[];
  speakerIds: number[];
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

  const pageSize = 100;

  let messages: ChatMessage[] = [];
  const eventEdits: { [index: string]: Record[] } = {};
  const eventMessages: { [index: string]: ChatMessage[] } = {};
  const eventIds = new Set<number>();
  const events: { [index: string]: EventObj } = {};
  let edits: Record[] = [];
  let chats: PopularChat[] = [];
  let page = 0;

  const messageSql = `
    SELECT * FROM "chatMessage"
    WHERE "chatId" LIKE 'chat-newsroom%' AND "createdAt" < $1
    ORDER BY "createdAt" DESC
    LIMIT ${pageSize}
  `;

  let count = 0;
  let i = 0;
  let j = 0;

  while (chats.length < 10) {
    const moreMessages = await sequelize.query<ChatMessage>(messageSql, {
      type: Sequelize.QueryTypes.SELECT,
      bind: [page === 0 ? new Date() : messages[messages.length - 1].createdAt],
    });

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
        createdAt: {
          [Sequelize.Op.lt]: page === 0 ? new Date() : edits[edits.length - 1].createdAt,
        },
      },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
    });

    edits = [...edits, ...records];

    if (moreMessages.length === 0 && records.length === 0) break;

    page += 1;

    while (count < page * pageSize) {
      if (i < messages.length - 1 && messages[i].createdAt < edits[j].createdAt) i += 1;
      else j += 1;
      count += 1;
      if (i === messages.length - 1 && j === edits.length - 1) break;
    }
    const latest = messages[i].createdAt < edits[j].createdAt
      ? messages[i].createdAt
      : edits[j].createdAt;

    const addEventEdit = (eventId: number, record: Record) => {
      if (!eventId) console.log(record.get({ plain: true }));
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
      console.log(message.chatId, message.chatId.slice('chat-newsroom:'.length));
      const eventId = +message.chatId.slice('chat-newsroom:'.length);
      if (!eventMessages[eventId]) eventMessages[eventId] = [];
      eventMessages[eventId].push(message);
      eventIds.add(eventId);
    }

    console.log(Object.keys(eventMessages));

    const withinHour = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    chats = [];
    await Promise.all([...eventIds].map(async eventId => {
      if (!events[eventId]) {
        events[eventId] = await EventService.findEvent(eventId, { plain: true, eventOnly: true });
      }
      const event = events[eventId];
      if (event.status !== 'admitted') return;

      const eventRecords = (eventEdits[eventId] || []).filter((r, idx) => {
        if (r.createdAt <= latest) return false;
        if (idx === 0) return true;
        return !(r.action === 'updateStackOrders' &&
          eventEdits[+eventId][idx - 1].action === 'updateStackOrders');
      });

      const chatId = ChatService.getChatId('newsroom', +eventId);
      const eventMessage = (eventMessages[eventId] || [])
        .filter(m => m.createdAt <= latest);

      chats.push({
        eventId: +eventId,
        event,
        chatId,
        count: eventRecords.length + eventMessage.length,
        updatedAt: eventRecords.length > 0 ? eventRecords[0].createdAt : event.updatedAt,
        editorIds: eventRecords.filter(r => r.createdAt >= withinHour).map(r => r.owner),
        speakerIds: eventMessage.filter(m => m.createdAt >= withinHour).map(m => m.authorId),
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
    chat.editorIds = [...new Set(chat.editorIds)];
    chat.speakerIds = [...new Set(chat.speakerIds)];
    const chatterSocket = await ChatService.getChatSocket('newsroom', chat.eventId);
    const sockets = await chatterSocket.fetchSockets();
    const clientIds = await Promise.all(sockets.map(socket => {
      return RedisService.get(`socket:${socket.id}`);
    }));
    chat.chatterIds = [...new Set(clientIds)];
  }));

  await RedisService.set(key, chats);
  await RedisService.expire(key, 60);

  res.status(200).json({ chatrooms: chats });
}

export default getPopularChatrooms;

import { RemoteSocket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RedstoneRequest, RedstoneResponse, SanitizedClient, EventObj } from '@Types';
import { RedisService, ChatService, ClientService } from '@Services';
import { ChatMessage, Record, EventStackNews, Event, Chat, ChatMember, sequelize, Sequelize } from '@Models';

interface ClientChat {
  chatId: string;
  eventId: number;
  editorIds: number[];
  editorIdsNow: number[];
  speakerIds: number[];
  speakerIdsNow: number[];
  chatterIds?: number[];
  count: number;
  unreadMessagesCount: number;
  eventOwner?: SanitizedClient;
  updatedAt: string;
  event?: EventObj;
}

async function getChatroomInfo(chatId: string, clientId: number) {
  const chatMember = await ChatMember.findOne({
    where: { chatId, clientId },
  });
  if (!chatMember) return;

  const [type, ids] = ChatService.revealChatroom(chatId);
  const key = `chatroom-info-${ChatService.getChatId(type, ids)}`;
  let chat: ClientChat = await RedisService.get(key);
  if (!chat) {
    chat = (await Chat.findByPk(chatId)).get({ plain: true }) as any;
    const within = new Date(Date.now() - 30 * 60 * 1000);
    if (type === 'newsroom') {
      const eventId = ids as number;
      chat.event = await Event.findByPk(eventId);
      const owner = await ClientService.findClient(chat.event.ownerId, {
        withAuths: false,
        withSubscriptions: false,
      });
      chat.eventOwner = ClientService.sanitizeClient(owner);
      const records = await sequelize.query<Record>(`
        SELECT *
          FROM record
          WHERE (action IN ('createStack', 'addNewsToStack') AND data->>'eventId' = '${eventId}')
          OR (action IN ('makeCommitForEvent', 'updateStackOrders', 'addNewsToEvent') AND target = ${eventId})
          ORDER BY "createdAt" DESC
          LIMIT 100
      `, {
        type: Sequelize.QueryTypes.SELECT,
      });

      chat.editorIds = Array.from(new Set(records.map(r => r.owner).filter(c => c)));
      chat.editorIdsNow = Array.from(new Set(records.filter(r => r.createdAt >= within && r.owner).map(r => r.owner)));
    }

    const messages = await ChatMessage.findAll({
      where: { chatId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    chat.speakerIds = Array.from(new Set(messages.map(m => m.authorId)));
    chat.speakerIdsNow = Array.from(new Set(messages.filter(m => m.createdAt >= within).map(m => m.authorId)));

    const chatterSocket = await ChatService.getChatSocket(chatId);
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

    await RedisService.set(key, chat);
    await RedisService.expire(key, 60);
  }

  chat.unreadMessagesCount = chatMember.lastRead ? await ChatMessage.count({
    where: {
      chatId,
      createdAt: {
        [Sequelize.Op.gt]: chatMember.lastRead,
      },
    },
  }) : 0;

  return chat;
}


async function getClientChatrooms(req: RedstoneRequest, res: RedstoneResponse) {
  const key = `client-chatrooms-60-${req.session.clientId}`;
  const existing = await RedisService.get(key);
  if (existing) {
    return res.status(200).json({
      chatrooms: (await Promise.all(existing.map((c: string) => getChatroomInfo(c, req.session.clientId)))).filter(c => c),
    });
  }

  const chatIds = new Set<string>();

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

  const messages = await sequelize.query<ChatMessage>(recentMessageSql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  for (const message of messages) {
    chatIds.add(message.chatId);
  }

  const recordsQuery = {
    action: {
      [Sequelize.Op.or]: [
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
  let records = await Record.findAll({
    where: {
      ...recordsQuery,
      createdAt: {
        [Sequelize.Op.gte]: twoDays,
      },
    },
    order: [['createdAt', 'DESC']],
    limit: 500,
  });

  if (records.length < 100) {
    const recordsB = await Record.findAll({
      where: {
        ...recordsQuery,
        createdAt: {
          [Sequelize.Op.lt]: twoDays,
        },
      },
      order: [['createdAt', 'DESC']],
      limit: 100 - records.length,
    });

    records = [...records, ...recordsB];
  }

  for (const record of records) {
    switch (record.action) {
    case 'createStack':
      chatIds.add(ChatService.getChatId('newsroom', record.data.eventId));
      break;
    case 'addNewsToStack':
      chatIds.add(ChatService.getChatId('newsroom', (record.data as EventStackNews).eventId));
      break;
    case 'makeCommitForEvent':
    case 'updateStackOrders':
    case 'addNewsToEvent':
      chatIds.add(ChatService.getChatId('newsroom', record.target));
    }
  }

  const promises = Array.from(chatIds).filter(c => c).map(c => getChatroomInfo(c, req.session.clientId));
  const chats = (await Promise.all(promises)).filter(c => c);

  await RedisService.set(key, Array.from(chatIds));
  await RedisService.expire(key, 60);

  res.status(200).json({ chatrooms: chats });
}

export default getClientChatrooms;

import { RedstoneRequest, RedstoneResponse } from '@Types';
import { RedisService, ClientService, EventService } from '@Services';
import { Chat, sequelize, Sequelize } from '@Models';

async function getPopularChatrooms(req: RedstoneRequest, res: RedstoneResponse) {
  const key = 'popular-chatrooms-60';
  const existing = await RedisService.get(key);
  if (existing) return res.status(200).json({ chatrooms: existing });

  const sql = `
    SELECT *
    FROM
      chat,
      (
        SELECT COUNT(DISTINCT(msg."authorId")) as count, msg."chatId"
        FROM (
          SELECT * FROM "chatMessage"
          WHERE "chatId" LIKE 'chat-newsroom%'
          ORDER BY "createdAt" DESC
          LIMIT 1000
        ) AS msg
        GROUP BY msg."chatId"
        LIMIT 10
      ) AS chats
    WHERE chat.id = chats."chatId"
    ORDER BY chats.count DESC
  `;

  const chats = await sequelize.query<Chat>(sql, {
    type: Sequelize.QueryTypes.SELECT,
  });

  await Promise.all(chats.map(async (chat: any) => {
    chat.event = await EventService.findEvent(chat.eventId, { plain: true, eventOnly: true });
    chat.eventOwner = await ClientService.findClient(chat.event.ownerId, {
      withAuths: false,
      withSubscriptions: false,
    });
    chat.eventOwner = ClientService.sanitizeClient(chat.eventOwner);
    chat.count = +chat.count;
  }));

  await RedisService.set(key, chats);
  await RedisService.expire(key, 60);

  res.status(200).json({ chatrooms: chats });
}

export default getPopularChatrooms;

import { Tag, sequelize, Sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService, RedisService } from '@Services';

async function getTagListByAlphabet(req: RedstoneRequest, res: RedstoneResponse) {
  const { alphabet } = UtilService;
  const { letter } = req.params;
  if (!alphabet.includes(letter)) return res.status(400).json({ message: 'Invalid input' });

  const key = `tag-list-alphabet-${letter}-60`;
  const existing = await RedisService.get(key);
  if (existing) return res.status(200).json({ tags: existing });

  const tags = await sequelize.query<Tag>(`
    SELECT * FROM tag
    WHERE status = 'visible'
      AND slug LIKE '${letter}%'
      AND EXISTS(
        SELECT 1
          FROM "eventTag", event
        WHERE tag.id = "eventTag"."tagId" AND "eventTag"."eventId" = event.id AND event.status = 'admitted'
      )
  `, {
    type: Sequelize.QueryTypes.SELECT,
  });

  await RedisService.set(key, tags);
  await RedisService.expire(key, 60);
  return res.status(200).json({ tags });
}

export default getTagListByAlphabet;

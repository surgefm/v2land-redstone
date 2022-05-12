import { Tag, sequelize, Sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService, RedisService } from '@Services';

const getTags = async (letter: string) => {
  const key = `tag-list-alphabet-${letter}-60`;
  const existing = await RedisService.get(key);
  if (existing) return existing;

  const tags = await sequelize.query<Tag>(`
    SELECT * FROM tag
    WHERE status = 'visible'
      AND slug LIKE '${letter}%'
      AND EXISTS(
        SELECT 1
          FROM "eventTag", event, tag as t
         WHERE t."hierarchyPath" @> tag."hierarchyPath"
           AND t.id = "eventTag"."tagId"
           AND "eventTag"."eventId" = event.id
           AND event.status = 'admitted'
      )
  `, {
    type: Sequelize.QueryTypes.SELECT,
  });

  await RedisService.set(key, tags);
  await RedisService.expire(key, 60);

  return tags;
};

async function getTagListByAlphabet(req: RedstoneRequest, res: RedstoneResponse) {
  const { alphabet } = UtilService;
  const { letter } = req.params;
  if (!alphabet.includes(letter) && letter !== 'all') {
    return res.status(400).json({ message: 'Invalid input' });
  }

  if (letter === 'all') {
    const allTags: { [index: string]: Tag } = {};
    await Promise.all(alphabet.map(async letter => {
      allTags[letter] = await getTags(letter);
    }));
    return res.status(200).json({ allTags });
  }

  const tags = await getTags(letter);
  return res.status(200).json({ tags });
}

export default getTagListByAlphabet;

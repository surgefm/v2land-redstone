import { sequelize, Sequelize } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService, RedisService } from '@Services';

async function getTagListStats(req: RedstoneRequest, res: RedstoneResponse) {
  const key = 'tag-list-stats-60';
  const existing = await RedisService.get(key);
  if (existing) return res.status(200).json({ tagListStats: existing });

  const stats: { [index: string]: number } = {};
  const { alphabet } = UtilService;

  const getStat = async (letter: string) => {
    const count = await sequelize.query(`
      SELECT COUNT(*) FROM tag
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

    stats[letter] = +(count[0] as any).count;
  };

  await Promise.all(alphabet.map(getStat));
  await RedisService.set(key, stats);
  await RedisService.expire(key, 60);
  return res.status(200).json({ tagListStats: stats });
}

export default getTagListStats;

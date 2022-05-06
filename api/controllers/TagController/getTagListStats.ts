import { Tag, Event } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { UtilService, RedisService } from '@Services';

async function getTagListStats(req: RedstoneRequest, res: RedstoneResponse) {
  const key = 'tag-list-stats-60';
  const existing = await RedisService.get(key);
  if (existing) return res.status(200).json({ tagListStats: existing });

  const stats: { [index: string]: number } = {};
  const { alphabet } = UtilService;

  const getStat = async (letter: string) => {
    const where = {
      status: 'visible',
      slug: {
        startsWith: letter,
      },
    };

    const count = await Tag.count({
      where: UtilService.convertWhereQuery(where),
      include: [{
        model: Event,
        as: 'events',
        where: { status: 'admitted' },
        through: { attributes: [] },
      }],
    });

    stats[letter] = count;
  };

  await Promise.all(alphabet.map(getStat));
  await RedisService.set(key, stats);
  await RedisService.expire(key, 60);
  return res.status(200).json({ tagListStats: stats });
}

export default getTagListStats;

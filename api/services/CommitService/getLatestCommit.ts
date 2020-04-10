import { Commit } from '@Models';
import { RedisService } from '@Services';

async function getLatestCommit(eventId: number) {
  const commit = await RedisService.get(`commit-${eventId}`);
  if (commit) return commit as Commit;

  return Commit.findOne({
    where: { eventId },
    order: [['time', 'DESC']],
    limit: 1,
  });
}

export default getLatestCommit;

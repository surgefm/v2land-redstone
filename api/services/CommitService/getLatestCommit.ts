import { Commit } from '@Models';

async function getLatestCommit(eventId: number) {
  return Commit.findOne({
    where: { eventId },
    order: [['time', 'DESC']],
    limit: 1,
  });
}

export default getLatestCommit;

import generateCommitContributionData from './generateCommitContributionData';
import { Commit } from '@Models';
import { Transaction } from 'sequelize';

async function generateAllCommitContributionData(eventId: number, { transaction }: { transaction?: Transaction } = {}) {
  const commits = await Commit.findAll({
    where: { eventId },
    transaction,
  });

  commits.sort((a, b) => a.time > b.time ? 1 : -1);
  for (const commit of commits) {
    await generateCommitContributionData(commit, { transaction });
  }
}

export default generateAllCommitContributionData;

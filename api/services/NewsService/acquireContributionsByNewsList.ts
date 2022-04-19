import { Transaction } from 'sequelize/types';
import getContribution from './getContribution';
import { News, Record } from '@Models';

async function acquireContributionsByNewsList(
  newsList: (News | { id: number; contribution?: Record[] })[],
  withData: boolean,
  { transaction }: { transaction?: Transaction } = {},
) {
  const queue = newsList.map(news => (async () => {
    news.contribution = await getContribution(news, withData, { transaction });
  })());

  await Promise.all(queue);
  return newsList;
}

export default acquireContributionsByNewsList;

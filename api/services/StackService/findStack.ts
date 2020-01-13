import { News, Stack } from '@Models';
import getContribution from './getContribution';
import { Transaction } from 'sequelize';

async function findStack (id: number, withContributionData = true, { transaction }: {
  transaction?: Transaction;
} = {}) {
  const stack = await Stack.findOne({
    where: { id },
    include: [{
      model: News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      limit: 15,
    }],
    transaction,
  });

  if (stack) {
    stack.newsCount = await News.count({
      where: {
        status: 'admitted',
        stackId: stack.id,
      },
    });

    if (!stack.time && stack.news && stack.news.length) {
      stack.time = stack.news[0].time;
    }
    stack.contribution = await getContribution(stack, withContributionData);
  }

  return stack;
}

export default findStack;

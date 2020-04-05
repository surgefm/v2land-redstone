import { News, Stack } from '@Models';
import { StackObj } from '@Types';
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

  if (!stack) return;

  const stackObj: StackObj = stack.get({ plain: true });
  stackObj.newsCount = await News.count({
    where: {
      status: 'admitted',
      stackId: stack.id,
    },
  });

  if (!stack.time && stack.news && stack.news.length) {
    stackObj.time = stack.news[0].time;
  }
  stackObj.contribution = await getContribution(stack, withContributionData);

  return stackObj;
}

export default findStack;

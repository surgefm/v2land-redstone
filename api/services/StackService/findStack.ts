import { News, Stack } from '@Models';
import { StackObj } from '@Types';
import getContribution from './getContribution';
import { Transaction } from 'sequelize';

async function findStack (id: number, withContributionData = true, { transaction }: {
  transaction?: Transaction;
} = {}) {
  const stack = await Stack.findByPk(id, {
    include: [{
      model: News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      through: { attributes: [] },
      required: false,
    }],
    transaction,
  });

  if (!stack) return;

  const stackObj: StackObj = stack.get({ plain: true });
  stackObj.newsCount = await stack.$count('news', {
    where: { status: 'admitted' },
    transaction,
  });

  if (!stack.time && stack.news && stack.news.length) {
    stackObj.time = stack.news[0].time;
  }
  stackObj.contribution = await getContribution(stack, withContributionData);

  return stackObj;
}

export default findStack;

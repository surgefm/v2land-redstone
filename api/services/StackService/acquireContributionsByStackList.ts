import { StackObj } from '@Types';
import getContribution from './getContribution';

async function acquireContributionsByStackList (stackList: StackObj[]) {
  const queue = [];

  const getContributionFn = async (stack: StackObj) => {
    stack.contribution = await getContribution(stack);
  };

  for (const stack of stackList) {
    queue.push(getContributionFn(stack));
  }

  await Promise.all(queue);
  return stackList;
}

export default acquireContributionsByStackList;

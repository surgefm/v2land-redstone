async function acquireContributionsByStackList (stackList) {
  const queue = [];

  const getContribution = async (stack) => {
    stack.contribution = await StackService.getContribution(stack);
  };

  for (const stack of stackList) {
    queue.push(getContribution(stack));
  }

  await Promise.all(queue);
  return stackList;
}

module.exports = acquireContributionsByStackList;

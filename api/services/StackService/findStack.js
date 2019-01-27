const SeqModels = require('../../../seqModels');

async function findStack (id, withContributionData = true, { transaction } = {}) {
  const stack = await SeqModels.Stack.findOne({
    where: { id },
    include: [{
      model: SeqModels.News,
      where: { status: 'admitted' },
      sort: [['time', 'ASC']],
      limit: 15,
    }],
    transaction,
  });

  if (stack) {
    stack.newsCount = await SeqModels.News.count({
      where: {
        status: 'admitted',
        stackId: stack.id,
      },
    });

    if (!stack.time && stack.news && stack.news.length) {
      stack.time = stack.news[0].time;
    }
    stack.contribution = await StackService.getContribution(id, withContributionData);
  }

  return stack;
}

module.exports = findStack;

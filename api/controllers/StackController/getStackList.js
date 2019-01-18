const SeqModels = require('../../../seqModels');

async function getStackList (req, res) {
  let where;
  let isManager = false;

  if (req.body && req.body.where) {
    where = req.body.where;
  }

  if (where && req.session.clientId) {
    const client = await SeqModels.Client.findOne({
      where: { id: req.session.clientId },
    });
    if (client && ['manager', 'admin'].includes(client.role)) {
      isManager = true;
    }
  }

  if (where && !isManager) {
    where.status = 'admitted';
  }

  const stacks = await SeqModels.Stack.findAll({
    where: where || {
      status: 'admitted',
    },
    include: [{
      model: SeqModels.News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      required: false,
      limit: 3,
    }],
    order: [['updatedAt', 'DESC']],
  });

  const getDetail = async (stack) => {
    stack = stack.get({ plain: true });
    if (stack.status === 'admitted' && stack.news && stack.news.length) {
      stack.time = stack.news[0].time;
    }
    stack.newsCount = await SeqModels.News.count({
      where: {
        status: 'admitted',
        stackId: stack.id,
      },
    });
  };

  const queue = stacks.map((stack) => getDetail(stack));
  await Promise.all(queue);

  await StackService.acquireContributionsByStackList(stacks);

  res.status(200).json({
    stackList: stacks,
  });
}

module.exports = getStackList;

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

  if (where) {
    where = UtilService.convertWhereQuery(where);
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

  const getDetail = async (i) => {
    let stack = stacks[i];
    stack = stack.get({ plain: true });
    if (!stack.time && stack.status === 'admitted' && stack.news && stack.news.length) {
      stack.time = stack.news[0].time;
    }
    stack.newsCount = await SeqModels.News.count({
      where: {
        status: 'admitted',
        stackId: stack.id,
      },
    });
    stacks[i] = stack;
  };

  const queue = [];
  for (let i = 0; i < stacks.length; i++) {
    queue.push(getDetail(i));
  }
  await Promise.all(queue);

  await StackService.acquireContributionsByStackList(stacks);

  res.status(200).json({
    stackList: stacks,
  });
}

module.exports = getStackList;

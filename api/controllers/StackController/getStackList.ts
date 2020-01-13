import { RedstoneRequest, RedstoneResponse } from '@Types';
import { News, Stack, Client } from '@Models';
import { UtilService, StackService } from '@Services';

async function getStackList (req: RedstoneRequest, res: RedstoneResponse) {
  let where;
  let isManager = false;

  if (req.body && req.body.where) {
    where = req.body.where;
  }

  if (where && req.session.clientId) {
    const client = await Client.findOne({
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

  const stacks = await Stack.findAll({
    where: where || {
      status: 'admitted',
    },
    include: [{
      model: News,
      as: 'news',
      where: { status: 'admitted' },
      order: [['time', 'ASC']],
      required: false,
      limit: 3,
    }],
    order: [['updatedAt', 'DESC']],
  });

  const stackObjs: any[] = stacks.map(() => null);
  const getDetail = async (i: number) => {
    let stack = stacks[i];
    let stackObj: any = stack.get({ plain: true });
    if (!stack.time && stack.status === 'admitted' && stack.news && stack.news.length) {
      stackObj.time = stack.news[0].time;
    }
    stackObj.newsCount = await News.count({
      where: {
        status: 'admitted',
        stackId: stack.id,
      },
    });
    stackObjs[i] = stackObj;
  };

  const queue = [];
  for (let i = 0; i < stacks.length; i++) {
    queue.push(getDetail(i));
  }
  await Promise.all(queue);

  await StackService.acquireContributionsByStackList(stackObjs);

  res.status(200).json({
    stackList: stackObjs,
  });
}

export default getStackList;

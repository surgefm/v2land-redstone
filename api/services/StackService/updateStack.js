const SeqModels = require('../../../seqModels');
const updateElasticsearchIndex = require('./updateElasticsearchIndex');

async function updateStack ({ id = -1, data = {}, clientId, transaction }) {
  let stack = await SeqModels.Stack.findOne({
    where: { id },
    transaction,
  });

  if (!stack) {
    throw new Error({
      status: 404,
      message: {
        message: '未找到该进展',
      },
    });
  }

  stack = stack.get({ plain: true });
  const oldStack = stack;

  const changes = {};
  for (const i of ['title', 'description', 'status', 'order', 'time']) {
    if (typeof data[i] !== 'undefined' && data[i] !== stack[i]) {
      changes[i] = data[i];
    }
  }

  if (Object.getOwnPropertyNames(changes).length === 0) {
    return {
      status: 200,
      message: {
        message: '什么变化也没有发生',
        stack,
      },
    };
  }

  const changesCopy = { ...changes };
  let news;

  if (changes.status) {
    if (changes.status === 'admitted') {
      news = await SeqModels.News.findOne({
        where: {
          stackId: stack.id,
          status: 'admitted',
        },
        transaction,
      });

      if (!news) {
        throw new Error('一个进展必须在含有一个已过审新闻的情况下方可开放');
      }
    }

    stack.status = changes.status;
    await SeqModels.Stack.upsert({
      id: stack.id,
      status: changes.status,
    }, { transaction });

    await SeqModels.Record.create({
      action: 'updateStackStatus',
      data: { status: changes.status },
      before: { status: stack.status },
      target: id,
      owner: clientId,
      model: 'Stack',
    }, { transaction });
  }

  delete changes.status;

  if (Object.keys(changes).length) {
    jsonData = JSON.stringify(stack);
    stack = { ...stack, ...changes };
    await SeqModels.Stack.upsert(stack, { transaction });

    await SeqModels.Record.create({
      action: 'updateStackDetail',
      target: id,
      owner: clientId,
      data: changes,
      before: jsonData,
      model: 'Stack',
    }, { transaction });
  }

  setTimeout(() => {
    if (data.enableNotification && changesCopy.status === 'admitted') {
      NotificationService.updateStackNotifications(stack, { force: data.forceUpdate });
      NotificationService.notifyWhenStackStatusChanged(oldStack, stack, clientId);
    }

    updateElasticsearchIndex({ stackId: stack.id });
  });

  return {
    status: 201,
    message: {
      message: '修改成功',
      stack,
    },
  };
}

module.exports = updateStack;

const SeqModels = require('../../seqModels');

const StackService = {

  async findStack(id, withContributionData = true) {
    const stack = await Stack.findOne({ id })
      .populate('news', {
        where: { status: 'admitted' },
        sort: 'time ASC',
        limit: 15,
      });

    stack.newsCount = await News.count({
      status: 'admitted',
      stack: stack.id,
    });

    if (stack) {
      if (!stack.time && stack.news.length) {
        stack.time = stack.news[0].time;
      }
      stack.contribution = await StackService.getContribution(id, withContributionData);
    }

    return stack;
  },

  async getContribution(stack, withData = true) {
    const select = ['model', 'target', 'operation', 'client'];
    if (withData) {
      select.push('before');
      select.push('data');
    }

    const records = await Record.find({
      action: ['createStack', 'invalidateStack', 'updateStackStatus', 'updateStackDetail'],
      target: stack.id,
      select,
    }).populate('client');

    for (const record of records) {
      if (record.client) {
        record.client = ClientService.sanitizeClient(record.client);
      }
    }

    return records;
  },

  async acquireContributionsByStackList(stackList) {
    const queue = [];

    const getContribution = async (stack) => {
      stack.contribution = await StackService.getContribution(stack);
    };

    for (const stack of stackList) {
      queue.push(getContribution(stack));
    }

    await Promise.all(queue);
    return stackList;
  },

  async updateStack({ id = -1, data = {}, clientId, transaction }) {
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
            stack: stack.id,
            status: 'admitted',
          },
          transaction,
        });

        if (!news) {
          throw new Error('一个进展必须在含有一个已过审新闻的情况下方可开放');
        }
      }

      jsonData = stack.toJSON();

      await stack.update({
        status: changes.status,
      }, { transaction });

      await SeqModels.Record.create({
        action: 'updateStackStatus',
        data: { status: changes.status },
        before: { status: stack.status },
        target: id,
        client: clientId,
        model: 'Stack',
      }, { transaction });
    }

    delete changes.status;

    jsonData = stack.toJSON();
    stack = await stack.update(changes, { transaction });

    await SeqModels.Record.create({
      action: 'updateStackDetail',
      target: id,
      client: clientId,
      data: changes,
      before: stack.toJSON(),
      model: 'Stack',
    }, { transaction });

    // if (news) {
    //   const before = {};
    //   for (const i of Object.keys(changes)) {
    //     before[i] = news[i];
    //   }

    //   if (Object.getOwnPropertyNames(changes).length > 0) {
    //     // FIXME: why???
    //     news = await SQLService.update({
    //       action: 'updateNewsDetail',
    //       data: changes,
    //       before,
    //       client: clientId,
    //       where: { id: news.id },
    //       model: 'news',
    //       pg,
    //     });
    //   }
    // }

    if (data.enableNotification && changesCopy.status === 'admitted') {
      const event = await SeqModels.Event.findOne({
        where: {
          id: stack.event,
        },
      });
      NotificationService.updateForNewStack(event, stack, data.forceUpdate);
      NotificationService.updateForNewNews(event, news, data.forceUpdate);
    }

    return {
      status: 201,
      message: {
        message: '修改成功',
        news,
      },
    };
  },

};

module.exports = StackService;

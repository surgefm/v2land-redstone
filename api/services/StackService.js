const StackService = {

  async findStack(id, withData = true) {
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
      stack.contribution = await StackService.getContribution(id, withData);
    }

    return stack;
  },

  async getContribution(id, withData = true) {
    const select = ['model', 'target', 'operation', 'client'];
    if (withData) {
      select.push('before');
      select.push('data');
    }

    const records = await Record.find({
      action: ['updateStackStatus', 'updateStackDetail', 'createStack'],
      target: id,
      select,
    }).populate('client');

    for (const record of records) {
      if (record.client) {
        record.client = ClientService.sanitizeClient(record.client);
      }
    }

    return records;
  },

  async updateStack(id = -1, data = {}, clientId, pg) {
    let stack = await Stack.findOne({ id });

    if (!stack) {
      await SQLService.rollback(pg);
      throw new Error({
        status: 404,
        message: {
          message: '未找到该进展',
        },
      });
    }

    const changes = {};
    for (const i of ['title', 'description', 'status', 'order']) {
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
        news = await News.findOne({
          stack: stack.id,
          status: 'admitted',
          sort: 'time DESC',
        });

        if (!news) {
          await SQLService.rollback(pg);
          throw new Error({
            status: 400,
            message: {
              message: '一个进展必须在含有一个已过审新闻的情况下方可开放',
            },
          });
        }
      }

      stack = await SQLService.update({
        action: 'updateStackStatus',
        data: { status: changes.status },
        before: { status: stack.status },
        client: clientId,
        where: { id },
        model: 'stack',
        pg,
      });
    }

    delete changes.status;

    stack = await SQLService.update({
      action: 'updateStackDetail',
      data: changes,
      before: stack,
      client: clientId,
      where: { id },
      model: 'stack',
      pg,
    });

    if (news) {
      const before = {};
      for (const i of Object.keys(changes)) {
        before[i] = news[i];
      }

      if (Object.getOwnPropertyNames(changes).length > 0) {
        news = await SQLService.update({
          action: 'updateNewsDetail',
          data: changes,
          before,
          client: clientId,
          where: { id: news.id },
          model: 'news',
          pg,
        });
      }
    }

    if (data.enableNotification && changesCopy.status === 'admitted') {
      const event = await Event.findOne({
        id: stack.event,
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

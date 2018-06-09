/**
 * StackController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const StackController = {

  getStack: async (req, res) => {
    const id = req.param('stackId');
    const stack = await StackService.findStack(id);
    if (stack) {
      if (stack.status !== 'admitted') {
        if (req.session.clientId) {
          client = await Client.findOne({ id: req.session.clientId });
          if (client && ['manager', 'admin'].includes(client.role)) {
            return res.status(200).json({ stack });
          }
        }
      } else {
        return res.status(200).json({ stack });
      }
    }

    res.status(404).json({
      message: '该进展不存在，或尚未通过审核',
    });
  },

  getStackList: async (req, res) => {
    let where;
    let isManager = false;

    if (req.body && req.body.where) {
      where = req.body.where;
    } else if (req.query && req.query.where) {
      where = req.query.where;
    }

    if (where) {
      try {
        where = JSON.parse(where);
      } catch (err) {/* happy */}
    }

    if (where && req.session.clientId) {
      const client = await Client.findOne({
        id: req.session.clientId,
      });
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    const stacks = await Stack.find({
      where: where || {
        status: 'admitted',
      },
      sort: 'updatedAt DESC',
    });

    res.status(200).json({
      stackList: stacks,
    });
  },

  updateStack: async (req, res) => {
    const id = req.param('stackId');
    const data = req.body;

    let stack = await Stack.findOne({ id });

    if (!news) {
      return res.status(404).json({
        message: '未找到该新闻',
      });
    }

    const changes = {};
    for (const i of ['title', 'description', 'status']) {
      if (data[i] && data[i] !== news[i]) {
        changes[i] = data[i];
      }
    }

    if (Object.getOwnPropertyNames(changes).length === 0) {
      return res.status(200).json({
        message: '什么变化也没有发生',
        stack,
      });
    }

    try {
      const query = {
        client: req.session.clientId,
        where: { id: stack.id },
        model: 'stack',
      };

      const changesCopy = { ...changes };
      let news;

      if (changes.status) {
        if (changes.status === 'admitted') {
          news = await News.findOne({
            stack: stack.id,
            status: 'admitted',
            sort: 'time DESC',
          });

          if (!hasNews) {
            return res.status(400).json({
              message: '一个进展必须在含有一个已过审新闻的情况下方可开放',
            });
          }
        }
        // const beforeStatus = stack.status;

        stack = await SQLService.update({
          action: 'updateStackStatus',
          data: { status: changes.status },
          before: { status: stack.status },
          ...query,
        });

        // const selfClient = req.currentClient;
        // if (beforeStatus !== 'admitted' && changes.status === 'admitted') {
        //   TelegramService.sendNewsAdmitted(news, selfClient);
        // } else if (beforeStatus !== 'rejected' && changes.status === 'rejected') {
        //   TelegramService.sendNewsRejected(news, selfClient);
        // }
      }

      delete changes.status;
      const before = {};
      for (const i of Object.keys(changes)) {
        before[i] = news[i];
      }

      if (Object.getOwnPropertyNames(changes).length > 0) {
        news = await SQLService.update({
          action: 'updateNewsDetail',
          data: changes,
          before,
          ...query,
        });
      }

      try {
        if (data.enableNotification && changesCopy.status === 'admitted') {
          const event = await Event.findOne({ id: stack.event });
          NotificationService.updateForNewStack(event, stack, data.forceUpdate);
          NotificationService.updateForNewNews(event, news, data.forceUpdate);
        }
      } catch (err) {
        res.serverError(err);
      }

      res.status(201).json({
        message: '修改成功',
        news,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

module.exports = StackController;

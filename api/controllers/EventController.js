/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const EventController = {

  getEvent: async (req, res) => {
    const name = req.param('eventName');
    const withContributionData = req.query
      ? req.query.withContributionData
      : (!req.body || req.body.withContributionData);
    const event = await EventService.findEvent(name, withContributionData);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: '未找到该事件',
      });
    }
  },

  getAllPendingEvents: async (req, res) => {
    const eventCollection = await Event.find({
      where: { status: 'pending' },
      sort: 'createdAt ASC',
    });
    res.status(200).json({ eventCollection });
  },

  getPendingNews: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    const { news } = await Event.findOne({ id: event.id })
      .populate('news', { status: 'pending' });

    return res.status(200).json({ newsCollection: news });
  },

  createEvent: async (req, res) => {
    if (!(req.body && req.body.name && req.body.description)) {
      return res.status(400).json({
        message: '缺少参数 name 或 description',
      });
    }

    const data = req.body;

    let event = await EventService.findEvent(data.name);
    let isManager = false;

    if (event) {
      return res.status(409).json({
        message: '已有同名事件或事件正在审核中',
      });
    }

    data.status = 'pending';

    if (req.session.clientId) {
      const client = await Client.findOne({ id: req.session.clientId });
      if (client && ['manager', 'admin'].includes(client.role)) {
        data.status = 'admitted';
        isManager = true;
      }
    }

    data.pinyin = EventService.generatePinyin(data.name);

    try {
      event = await SQLService.create({
        model: 'event',
        data,
        action: 'createEvent',
        client: req.session.clientId,
      });

      res.status(201).json({
        message: isManager
          ? '事件创建成功'
          : '提交成功，该事件在社区管理员审核通过后将很快开放',
        event,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  updateEvent: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name);

    if (!req.body) {
      return res.status(400).json({
        message: '缺少参数',
      });
    }

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    const changes = {};
    for (const attribute of ['name', 'description', 'status']) {
      if (req.body[attribute] && req.body[attribute] !== event[attribute]) {
        changes[attribute] = req.body[attribute];
      }
    }

    if (Object.getOwnPropertyNames(changes).length === 0) {
      return res.status(200).json({
        message: '什么变化也没有发生',
        event,
      });
    }

    if (changes.name) {
      changes.pinyin = EventService.generatePinyin(changes.name);
    }

    try {
      const query = {
        model: 'event',
        client: req.session.clientId,
        where: { id: event.id },
      };

      if (changes.status) {
        await SQLService.update({
          action: 'updateEventStatus',
          data: { status: changes.status },
          before: { status: event.status },
          ...query,
        });
      }

      if (
        (event.status === 'pending' || event.status === 'rejected') &&
        changes.status === 'admitted'
      ) {
        // 再说一遍，不要 await，再说一遍，不要 await
        TelegramService.sendEvent(event);
      }

      delete changes.status;
      const before = {};
      for (const i of Object.keys(changes)) {
        before[i] = event[i];
      }

      if (Object.getOwnPropertyNames(changes).length > 0) {
        await SQLService.update({
          action: 'updateEventDetail',
          data: changes,
          before,
          ...query,
        });
      }

      res.status(201).json({
        message: '修改成功',
        event,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  getEventList: async (req, res) => {
    let page = 1;
    let where;
    let isManager = false;

    if (req.body && req.body.page) {
      page = req.body.page;
    } else if (req.query && req.query.page) {
      page = req.query.page;
    }

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
      const client = await Client.findOne({ id: req.session.clientId });
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    const events = await Event.find({
      where: where || { status: 'admitted' },
      sort: 'updatedAt DESC',
    })
      .paginate({
        page,
        limit: 10,
      })
      .populate('headerImage');

    res.status(200).json({ eventList: events });
  },

  createNews: async (req, res) => {
    const name = req.param('eventName');
    const data = req.body;

    let news;
    let client;
    let isManager = false;

    if (!data.url) {
      return res.status(400).json({
        message: '缺少 url 参数',
      });
    }

    const event = await EventService.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    data.event = event.id;
    data.status = 'pending';

    if (req.session.clientId) {
      client = await Client.findOne({ id: req.session.clientId });
      if (client && ['manager', 'admin'].includes(client.role)) {
        data.status = 'admitted';
        isManager = true;
      }
    }

    const existingNews = await News.findOne({ url: data.url, event: event.id });
    if (existingNews) {
      return res.status(409).json({
        message: '审核队列或新闻合辑内已有相同链接的新闻',
      });
    }

    try {
      news = await SQLService.create({
        model: 'news',
        data,
        action: 'createNews',
        client: req.session.clientId,
      });
      res.status(201).json({
        message: isManager
          ? '新闻添加成功'
          : '提交成功，该新闻在社区管理员审核通过后将很快开放',
        news,
      });
    } catch (err) {
      return res.serverError(err);
    }

    if (data.status === 'admitted' && isManager) {
      await NotificationService.updateForNewNews(event, news);
    }
  },

  updateHeaderImage: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    if (req.method === 'PUT' && !event.headerImage) {
      return res.status(400).json({
        message: '未找到该题图，请改用 POST 方法请求创建',
      });
    }

    if (req.method === 'POST' && event.headerImage) {
      return res.status(400).json({
        message: '该事件已有题图，请改用 PUT 方法请求修改',
      });
    }

    let headerImage = { event: event.id };

    for (const attribute of ['imageUrl', 'source', 'sourceUrl']) {
      if (req.body[attribute]) {
        headerImage[attribute] = req.body[attribute];
      }
    }

    try {
      const data = {
        where: { event: event.id },
        data: headerImage,
        client: req.session.clientId,
        model: 'HeaderImage',
      };
      if (req.method === 'PUT') {
        headerImage = await SQLService.update({
          action: 'updateEventHeaderImage',
          before: event.headerImage,
          ...data,
        });
      } else {
        headerImage = await SQLService.create({
          action: 'createEventHeaderImage',
          ...data,
        });
      }
    } catch (err) {
      return res.serverError(err);
    }

    res.status(201).json({
      message: event.headerImage ? '修改成功' : '添加成功',
      headerImage,
    });
  },
};

module.exports = EventController;

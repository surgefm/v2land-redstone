/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require('lodash');

/**
  * 验证 number 参数
  * 若 number 是一个 string 且不 match 正则，则返回 undefined
  */
const validateNumber = (number, defaultValue) => {
  if (_.isNumber(number)) {
    return number;
  } else if (_.isString(number)) {
    if (!/^\+?(0|[1-9]\d*)$/.test(number)) return undefined;
    return parseInt(number);
  }

  return defaultValue;
};

const EventController = {

  getEvent: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name, {
      includes: req.query,
    });

    if (event) {
      event.contribution = await EventService.getContribution(event, true);
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
    let client;
    if (!(req.body && req.body.name && req.body.description)) {
      return res.status(400).json({
        message: '缺少参数 name 或 description',
      });
    }

    const data = req.body;

    let event = await EventService.findEvent(data.name);

    if (event) {
      return res.status(409).json({
        message: '已有同名事件或事件正在审核中',
      });
    }

    data.status = 'pending';

    data.pinyin = EventService.generatePinyin(data.name);

    try {
      event = await SQLService.create({
        model: 'event',
        data,
        action: 'createEvent',
        client: req.session.clientId,
      });

      res.status(201).json({
        message: '提交成功，该事件在社区管理员审核通过后将很快开放',
        event,
      });

      TelegramService.sendEventCreated(event, client);
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

      const selfClient = req.currentClient;
      if (
        (event.status === 'pending' || event.status === 'rejected') &&
        changes.status === 'admitted'
      ) {
        TelegramService.sendEventAdmitted(event, selfClient);
      } else if (
        event.status === 'pending' &&
        changes.status === 'rejected'
      ) {
        TelegramService.sendEventRejected(event, selfClient);
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
    let page;
    let where;
    let isManager = false;
    let mode = 0; // 0: latest updated; 1:

    switch (req.method) {
    case 'GET':
      page = req.query.page;
      // 0: oldest event first (by first stack) ; 1: newest event first (by latest news)
      mode = req.query.mode;

      if (req.query.where && typeof req.query.where === 'string') {
        where = JSON.parse(where);
      } else if (req.query.status) {
        where = {
          status: req.query.status,
        };
      }
      break;
    case 'POST':
      // 兼容古老代码 POST 方法
      page = req.body.page;
      where = req.body.where;
      mode = req.body.mode;
      break;
    }

    page = validateNumber(page, 1);
    mode = validateNumber(mode, 0);

    if (_.isUndefined(page)) {
      return res.status(400).json({
        message: '参数有误：page',
      });
    }

    if (_.isUndefined(mode)) {
      return res.status(400).json({
        message: '参数有误：mode',
      });
    }

    if (where && req.session && req.session.clientId) {
      const client = await Client.findOne({ id: req.session.clientId });
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    const events = await EventService.getEventList(mode, page, where || { status: 'admitted' });

    // let events = await Event.find({
    //   where: where || { status: 'admitted' },
    //   sort: 'updatedAt DESC',
    // })
    //   .paginate({
    //     page,
    //     limit: 10,
    //   })
    //   .populate('headerImage');

    await EventService.acquireContributionsByEventList(events);

    res.status(200).json({ eventList: events });
  },

  createStack: async (req, res) => {
    const name = req.param('eventName');
    const data = req.body;
    const { title, description, order, time } = data;

    if (!title) {
      return res.status(400).json({
        message: '缺少参数：title',
      });
    }

    const event = await EventService.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    const id = event.id;

    try {
      const stack = await SQLService.create({
        model: 'stack',
        data: {
          status: 'pending',
          title,
          description,
          order: order || -1,
          event: id,
          time,
        },
        action: 'createStack',
        client: req.session.clientId,
      });
      res.status(201).json({
        message: '提交成功，该进展在社区管理员审核通过后将很快开放',
        stack,
      });
    } catch (err) {
      return res.serverError(err);
    }

    if (data.status === 'admitted' && isManager) {
      await NotificationService.updateForNewNews(event, news);
    }
  },

  createNews: async (req, res) => {
    const name = req.param('eventName');
    const data = req.body;

    let news;
    let client;

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
        message: '提交成功，该新闻在社区管理员审核通过后将很快开放',
        news,
      });
      TelegramService.sendNewsCreated(event, news, client);
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

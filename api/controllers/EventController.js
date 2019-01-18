/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const axios = require('axios');
const SeqModels = require('../../seqModels');
const _ = require('lodash');
const isUrl = require('../../utils/urlValidator');
const urlTrimmer = require('v2land-url-trimmer');

const EventController = {

  getEvent: require('./EventController/getEvent'),

  getAllPendingEvents: async (req, res) => {
    const eventCollection = await SeqModels.Event.findAll({
      where: { status: 'pending' },
      sort: [['createdAt', 'ASC']],
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

    const newsCollection = await SeqModels.News.findAll({
      where: {
        eventId: event.id,
        status: 'pending',
      },
    });

    return res.status(200).json({ newsCollection });
  },

  createEvent: async (req, res) => {
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
      await sequelize.transaction(async transaction => {
        event = await SeqModels.Event.create(data, { transaction });
        await RecordService.create({
          model: 'Event',
          data,
          action: 'createEvent',
          owner: req.session.clientId,
          target: event.id,
        }, { transaction });
      });

      res.status(201).json({
        message: '提交成功，该事件在社区管理员审核通过后将很快开放',
        event,
      });

      NotificationService.notifyWhenEventCreated(event, req.session.clientId);
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
      await sequelize.transaction(async transaction => {
        const query = {
          model: 'Event',
          owner: req.session.clientId,
        };

        if (changes.status) {
          await SeqModels.Event.update({
            status: changes.status,
          }, {
            where: { id: event.id },
            transaction,
          });

          await RecordService.update({
            ...query,
            action: 'updateEventStatus',
            data: { status: changes.status },
            before: event.status,
            target: event.id,
          }, { transaction });
        }

        const selfClient = req.currentClient;
        NotificationService.notifyWhenEventStatusChanged(event, changes, selfClient);

        delete changes.status;
        const before = {};
        for (const i of Object.keys(changes)) {
          before[i] = event[i];
        }

        if (Object.keys(changes).length > 0) {
          await SeqModels.Event.update(changes, {
            where: { id: event.id },
            transaction,
          });

          await RecordService.update({
            ...query,
            action: 'updateEventDetail',
            data: changes,
            before,
            target: event.id,
          }, { transaction });
        }
      });

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
    let mode; // 0: latest updated; 1:
    let isManager = false;

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

    page = UtilService.validateNumber(page, 1);
    mode = UtilService.validateNumber(mode, 0);

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

    try {
      await sequelize.transaction(async transaction => {
        if (where && req.session && req.session.clientId) {
          const client = await SeqModels.Client.findOne({
            where: { id: req.session.clientId },
            transaction,
          });

          if (client && ['manager', 'admin'].includes(client.role)) {
            isManager = true;
          }
        }

        if (where && !isManager) {
          where.status = 'admitted';
        }

        let events = await SeqModels.Event.findAll({
          where,
          include: [{
            as: 'headerImage',
            model: SeqModels.HeaderImage,
            required: false,
          }],
          order: [['updatedAt', 'DESC']],
          transaction,
        });

        events = events.map(e => e.toJSON());

        await EventService.acquireContributionsByEventList(events);

        res.status(200).json({ eventList: events });
      });
    } catch (err) {
      console.log(err);
      return res.serverError(err);
    }
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
      await sequelize.transaction(async transaction => {
        const data = {
          status: 'pending',
          title,
          description,
          order: order || -1,
          eventId: id,
          time,
        };
        const stack = await SeqModels.Stack.create(data, { transaction });
        await RecordService.create({
          model: 'stack',
          data,
          target: stack.id,
          owner: req.session.clientId,
          action: 'createStack',
        }, { transaction });

        res.status(201).json({
          message: '提交成功，该进展在社区管理员审核通过后将很快开放',
          stack,
        });
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  createNews: async (req, res) => {
    const name = req.param('eventName');
    const data = req.body;

    let client;
    if (req.session.clientId) {
      client = await SeqModels.Client.findById(req.session.clientId);
    }

    for (const attr of ['url', 'source', 'abstract']) {
      if (!data[attr]) {
        return res.status(400).json({
          message: `缺少 ${attr} 参数`,
        });
      }
    }

    data.url = (await urlTrimmer.trim(data.url)).toString();
    const event = await EventService.findEvent(name);
    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    data.eventId = event.id;
    data.status = 'pending';

    try {
      await sequelize.transaction(async transaction => {
        const existingNews =
          await SeqModels.News.findOne({
            where: {
              url: data.url,
              eventId: event.id,
            },
            transaction,
          });
        if (existingNews) {
          return res.status(409).json({
            message: '审核队列或新闻合辑内已有相同链接的新闻',
          });
        }

        // Ask the Wayback Machine of Internet Archive to archive the webpage.
        axios.get(`https://web.archive.org/save/${data.url}`);

        const news = await SeqModels.News.create(data, {
          raw: true,
          transaction,
        });

        await RecordService.create({
          model: 'News',
          data,
          target: news.id,
          action: 'createNews',
          owner: req.session.clientId,
        }, { transaction });

        res.status(201).json({
          message: '提交成功，该新闻在社区管理员审核通过后将很快开放',
          news,
        });
        NotificationService.notifyWhenNewsCreated(news, client);
      });
    } catch (err) {
      console.error(err);
      return res.serverError(err);
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

    if (!req.body.imageUrl) {
      return res.status(400).json({
        message: '缺少参数：imageUrl。',
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

    const headerImage = { eventId: event.id };

    for (const attribute of ['imageUrl', 'source', 'sourceUrl']) {
      if (req.body[attribute]) {
        headerImage[attribute] = req.body[attribute];
      }
    }

    if (headerImage.sourceUrl && !isUrl(headerImage.sourceUrl)) {
      return res.status(400).json({
        message: '链接格式不规范',
      });
    }

    try {
      const query = {
        model: 'HeaderImage',
        owner: req.session.clientId,
        data: headerImage,
      };

      await sequelize.transaction(async transaction => {
        if (req.method === 'PUT') {
          await SeqModels.HeaderImage.upsert(headerImage, {
            where: { id: event.headerImage.id },
            transaction,
          });
          await RecordService.update({
            ...query,
            action: 'updateEventHeaderImage',
            target: headerImage.id,
            before: event.headerImage,
          }, { transaction });
        } else {
          await SeqModels.HeaderImage.create({
            ...headerImage,
            eventId: event.id,
          }, { transaction });
          await RecordService.create({
            ...query,
            action: 'createEventHeaderImage',
          }, { transaction });
        }
      });
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

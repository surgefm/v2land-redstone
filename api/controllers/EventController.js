/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const EventController = {

  getEvent: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: '未找到该事件',
      });
    }
  },

  getPendingNews: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventService.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到该事件',
      });
    }

    const newsCollection = await News.find({
      status: 'pending',
      event: event.id,
    });

    return res.status(200).json({ newsCollection });
  },

  createEvent: async (req, res) => {
    if (!(req.body && req.body.name && req.body.description)) {
      return res.status(400).json({
        message: '缺少参数 name 或 description',
      });
    }

    let event = await EventService.findEvent(req.body.name);

    if (event) {
      return res.status(409).json({
        message: '已有同名事件或事件正在审核中',
      });
    }

    req.body.status = 'pending';

    try {
      event = await SQLService.create({
        model: 'event',
        data: req.body,
        action: 'createEvent',
        client: req.session.clientId,
      });

      res.status(201).json({
        message: '提交成功，该事件在社区管理员审核通过后将很快开放',
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
          ...query,
        });
      }

      delete changes.status;
      if (Object.getOwnPropertyNames(changes).length > 0) {
        await SQLService.update({
          action: 'updateEventDetail',
          data: changes,
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

    if (req.body && req.body.page) {
      page = req.body.page;
    } else if (req.query && req.query.page) {
      page = req.query.page;
    }

    const events = await Event.find({
      where: { status: 'admitted' },
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
      res.status(201).json({ news });
    } catch (err) {
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

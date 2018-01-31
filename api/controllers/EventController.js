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

    const { name, description } = req.body;
    let event = await EventService.findEvent(name);

    if (event) {
      return res.status(409).json({
        message: '已有同名事件或事件正在审核中',
      });
    }

    const client = await req.pgPool.connect();

    try {
      const now = new Date();
      await client.query(`BEGIN`);
      await client.query(`
        INSERT INTO event(name, description, status, "createdAt", "updatedAt")
        VALUES ($1, $2 , 'pending', $3, $3)`, [name, description, now]);
      const queryRes = await client.query(`SELECT * FROM event WHERE name=$1`, [name]);
      event = queryRes.rows[0];
      await client.query(`
        INSERT INTO record(model, operation, action, client, data, target, "createdAt", "updatedAt")
        VALUES ('Event', 'create', 'createEvent', $1, $2, $3, $4, $4)
      `, [req.session.clientId, event, event.id, now]);
      await client.query(`COMMIT`);

      res.status(201).json({
        message: '提交成功，该事件在社区管理员审核通过后将很快开放',
        event,
      });
    } catch (err) {
      sails.log.error(err);
      return res.status(500).json({
        message: '服务器发生未知错误，请联系开发者。',
      });
    } finally {
      client.release();
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

    for (const attribute of ['name', 'description', 'status']) {
      if (req.body[attribute]) {
        event[attribute] = req.body[attribute];
      }
    }

    try {
      await event.save();

      res.status(201).json({
        message: '修改成功',
        event,
      });
    } catch (err) {
      return res.status(err.status).json(err);
    }

    try {
      const record = {
        model: 'Event',
        operation: 'update',
        data: event,
        client: req.session.clientId,
        target: event.id,
      };

      if (req.body.status) {
        record.action = 'updateEventStatus';
        await Record.create(record);
      }

      if (req.body.name || req.body.description) {
        record.action = 'updateEventDetail';
        await Record.create(record);
      }
    } catch (err) {
      console.log(err);
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
      news = await News.create(data);
      res.status(201).json(news);
    } catch (err) {
      return res.status(err.status).json(err);
    }

    await Record.create({
      model: 'News',
      target: news.id,
      operation: 'create',
      action: 'createNews',
      data: news,
      client: req.session.clientId,
    });
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
      if (req.method === 'PUT') {
        headerImage = await HeaderImage.update({ event: event.id }, headerImage);
        await Event.update({ id: event.id }, { headerImage: headerImage[0].id });
      } else {
        headerImage = await HeaderImage.create(headerImage);
        await Event.update({ id: event.id }, { headerImage: headerImage.id });
      }
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(201).json({
      message: event.headerImage ? '修改成功' : '添加成功',
    });

    const data = headerImage.id ? headerImage : headerImage[0];
    await Record.create({
      model: 'HeaderImage',
      target: data.id,
      operation: req.method === 'POST' ? 'create' : 'update',
      action: req.method === 'POST' ? 'createEventHeaderImage' : 'updateEventHeaderImage',
      data: data,
      client: req.session.clientId,
    });
  },
};

module.exports = EventController;

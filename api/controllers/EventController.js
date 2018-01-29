/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const EventController = {
  findEvent: async (eventName) => {
    const event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    })
      .populate('news')
      .populate('headerImage');

    return event;
  },

  getEvent: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventController.findEvent(name);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: '未找到该事件',
      });
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
        message: '错误的请求格式',
      });
    }

    const event = await EventController.findEvent(name);

    if (!event) {
      return res.status(404).json({
        message: '未找到改事件',
      });
    }

    data.event = event.id;

    const existingNews = await News.findOne({ url: data.url });
    if (existingNews && existingNews.status !== 'pending') {
      return res.status(409).json({
        message: '审核队列内已有相同链接的新闻',
      });
    }

    try {
      news = await News.create(data);
    } catch (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(201).json(news);
  },

  updateHeaderImage: async (req, res) => {
    const name = req.param('eventName');
    const event = await EventController.findEvent(name);

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
  },
};

module.exports = EventController;

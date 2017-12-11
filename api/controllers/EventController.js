/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let EventController = {
  findEvent: async (eventName) => {
    let event = await Event.findOne({
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
    let name = req.param('eventName');
    let event = await EventController.findEvent(name);

    if (event) {
      res.status(200).json(event);
    } else {
      res.status(404).json({
        message: '未找到该事件',
      });
    }
  },

  updateHeaderImage: async (req, res) => {
    let name = req.param('eventName');
    let event = await EventController.findEvent(name);

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

    for (let attribute of ['imageUrl', 'source', 'sourceUrl']) {
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

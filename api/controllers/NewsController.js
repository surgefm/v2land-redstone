/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getAllPendingNews: async (req, res) => {
    const newsCollection = await News.find({
      status: 'pending',
    });

    return res.status(200).json({ newsCollection });
  },

  getNewsList: async (req, res) => {
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

    if (where) {
      const newsList = await News.find({
        where,
        sort: 'updatedAt DESC',
      }).paginate({
        page,
        limit: 15,
      });

      res.status(200).json({ newsList });
    } else {
      res.status(400).json({
        message: '缺少参数：where',
      });
    }
  },

  updateNews: async (req, res) => {
    const id = req.param('news');
    const data = req.body;

    let news = await News.findOne({ id });

    if (!news) {
      return res.status(404).json({
        message: '未找到该新闻',
      });
    }

    const changes = {};
    for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment']) {
      if (data[i] && data[i] !== news[i]) {
        changes[i] = data[i];
      }
    }

    if (Object.getOwnPropertyNames(changes).length === 0) {
      return res.status(200).json({
        message: '什么变化也没有发生',
        news,
      });
    }

    try {
      const query = {
        client: req.session.clientId,
        where: { id: news.id },
        model: 'news',
      };

      const changesCopy = { ...changes };

      if (changes.status) {
        news = await SQLService.update({
          action: 'updateNewsStatus',
          data: { status: changes.status },
          ...query,
        });
      }

      delete changes.status;
      if (Object.getOwnPropertyNames(changes).length > 0) {
        news = await SQLService.update({
          action: 'updateNewsDetail',
          data: changes,
          ...query,
        });
      }

      if (changesCopy.status || changesCopy.time) {
        const event = await Event.findOne({ id: news.event });
        await NotificationService.updateForNewNews(event, news);
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

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

  getNews: async (req, res) => {
    let id;
    if (req.body && req.body.news) {
      id = req.body.news;
    } else if (req.query && req.query.news) {
      id = req.query.news;
    } else if (req.param('news')) {
      id = req.param('news');
    }

    if (!id) {
      return res.status(400).json({
        message: '缺少参数：news。',
      });
    }

    const news = await News.findOne({ id }).populate('stack');
    if (!news) {
      return res.status(404).json({ message: '未找到该新闻' });
    }

    if (news.status !== 'admitted') {
      if (req.session.clientId) {
        const client = await Client.findOne({ id: req.session.clientId });
        if (!client || !['manager', 'admin'].includes(client.role)) {
          return res.status(404).json({ message: '该新闻尚未通过审核' });
        }
      } else {
        return res.status(404).json({ message: '该新闻尚未通过审核' });
      }
    }

    news.contribution = await NewsService.getContribution(news, true);
    res.status(200).json({ news });
  },

  getNewsList: async (req, res) => {
    let page = 1;
    let where;
    let withContributionData;
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

    if (req.body && req.body.withContributionData) {
      withContributionData = req.body.withContributionData;
    } else if (req.query && req.query.withContributionData) {
      withContributionData = req.query.withContributionData;
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
      try {
        const newsList = await News.find({
          where,
          sort: 'updatedAt DESC',
        }).paginate({
          page,
          limit: 15,
        });

        await NewsService.acquireContributionsByNewsList(newsList, withContributionData);

        res.status(200).json({ newsList });
      } catch (err) {
        res.serverError(err);
      }
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
    for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment', 'stack']) {
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
      const latestNews = await News.findOne({
        where: { event: news.event, status: 'admitted' },
        sort: 'time DESC',
      });

      const updateNotification =
        (latestNews && +latestNews.id === +news.id) ||
        (changesCopy.status && changesCopy.status !== news.status) ||
        (changesCopy.time && new Date(changesCopy.time).getTime() !== new Date(news.time).getTime());

      if (changes.status) {
        const beforeStatus = news.status;

        news = await SQLService.update({
          action: 'updateNewsStatus',
          data: { status: changes.status },
          before: { status: news.status },
          ...query,
        });

        const selfClient = req.currentClient;
        if (beforeStatus !== 'admitted' && changes.status === 'admitted') {
          TelegramService.sendNewsAdmitted(news, selfClient);
        } else if (beforeStatus !== 'rejected' && changes.status === 'rejected') {
          TelegramService.sendNewsRejected(news, selfClient);
        } else if (beforeStatus === 'admitted' && changes.status !== 'admitted' && news.stack) {
          const newsCount = await News.count({ stack: news.stack, status: 'admitted' });
          if (!newsCount) {
            const stack = await Stack.count({ id: news.stack, status: 'admitted' });
            if (stack) {
              await SQLService.update({
                action: 'invalidateStack',
                data: { status: 'invalid' },
                before: { status: 'admitted' },
                model: 'stack',
                where: { id: news.stack },
                client: req.session.clientId,
              });
            }
          }
        }
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
        if (updateNotification) {
          const event = await Event.findOne({ id: news.event });
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

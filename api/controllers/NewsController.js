/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const SeqModels = require('../../seqModels');

module.exports = {
  getAllPendingNews: async (req, res) => {
    const newsCollection = await SeqModels.News.findAll({
      where: {
        status: 'pending',
      },
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

    const news = await SeqModels.News.findOne({
      where: { id },
      include: [{
        model: SeqModels.Stack,
        as: 'stack',
      }],
    });
    if (!news) {
      return res.status(404).json({ message: '未找到该新闻' });
    }

    if (news.status !== 'admitted') {
      if (req.session.clientId) {
        const client = await SeqModels.Client.findById(req.session.clientId);
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
      const client = await SeqModels.Client.findById(req.session.clientId);
      if (client && ['manager', 'admin'].includes(client.role)) {
        isManager = true;
      }
    }

    if (where && !isManager) {
      where.status = 'admitted';
    }

    if (where) {
      try {
        const newsList = await SeqModels.News.find({
          where,
          sort: 'updatedAt DESC',
          offset: (page - 1) * 15,
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

    let news = await SeqModels.News.findById(id);

    if (!news) {
      return res.status(404).json({
        message: '未找到该新闻',
      });
    }

    const changes = {};
    for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment', 'stackId']) {
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
      await sequelize.transaction(async transaction => {
        const changesCopy = { ...changes };
        const latestNews = await SeqModels.News.findOne({
          where: { eventId: news.eventId, status: 'admitted' },
          attributes: ['id'],
          sort: [['time', 'DESC']],
        });

        const updateNotification =
          (latestNews && +latestNews.id === +news.id) ||
          (changesCopy.status && changesCopy.status !== news.status) ||
          (changesCopy.time && new Date(changesCopy.time).getTime() !== new Date(news.time).getTime());

        let newNews = news;
        if (changes.status) {
          const beforeStatus = news.status;

          newNews = await news.update({
            status: changes.status,
          }, { transaction });
          await RecordService.create({
            model: 'news',
            action: 'updateNewsStatus',
            before: beforeStatus,
            data: changes.status,
            target: news.id,
            client: req.session.clientId,
          }, { transaction });

          NotificationService.notifyWhenNewsStatusChanged(news, newNews, req.session.clientId);

          if (beforeStatus === 'admitted' && changes.status !== 'admitted' && news.stackId) {
            const newsCount = await SeqModels.News.count({
              where: { stackId: news.stackId, status: 'admitted' },
            });
            if (!newsCount) {
              const stack = await SeqModels.Stack.findOne({
                where: { id: news.stackId, status: 'admitted' },
              });
              if (stack) {
                await stack.update({ status: 'invalid' }, { transaction });
                await RecordService.update({
                  action: 'invalidateStack',
                  data: { status: 'invalid' },
                  before: { status: 'admitted' },
                  model: 'stack',
                  target: stack.id,
                  client: req.session.clientId,
                }, { transaction });
              }
            }
          }
        }

        delete changes.status;
        const before = {};
        for (const i of Object.keys(changes)) {
          before[i] = newNews[i];
        }

        if (Object.getOwnPropertyNames(changes).length > 0) {
          news = await newNews.update(changes, { transaction });
          await RecordService.update({
            action: 'updateNewsDetail',
            data: changes,
            before,
            target: news.id,
            client: req.session.clientId,
            model: 'news',
          }, { transaction });
        }

        if (updateNotification) {
          NotificationService.updateNewsNotification(news, {
            force: data.forceUpdate,
          });
        }

        res.status(201).json({
          message: '修改成功',
          news,
        });
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

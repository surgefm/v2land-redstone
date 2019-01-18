const SeqModels = require('../../../seqModels');
const urlTrimmer = require('v2land-url-trimmer');

async function updateNews (req, res) {
  const id = req.param('news');
  const data = req.body;

  let news = await SeqModels.News.findById(id);

  if (!news) {
    return res.status(404).json({
      message: '未找到该新闻',
    });
  }

  if (data.url) {
    data.url = (await urlTrimmer.trim(data.url)).toString();
  }

  const changes = {};
  for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment', 'stackId', 'isInTemporaryStack']) {
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
        transaction,
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
          owner: req.session.clientId,
        }, { transaction });

        NotificationService.notifyWhenNewsStatusChanged(news, newNews, req.session.clientId);

        if (beforeStatus === 'admitted' && changes.status !== 'admitted' && news.stackId) {
          const newsCount = await SeqModels.News.count({
            where: { stackId: news.stackId, status: 'admitted' },
          });
          if (!newsCount) {
            const stack = await SeqModels.Stack.findOne({
              where: { id: news.stackId, status: 'admitted' },
              transaction,
            });
            if (stack) {
              await stack.update({ status: 'invalid' }, { transaction });
              await RecordService.update({
                action: 'invalidateStack',
                data: { status: 'invalid' },
                before: { status: 'admitted' },
                model: 'stack',
                target: stack.id,
                owner: req.session.clientId,
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
          owner: req.session.clientId,
          model: 'news',
        }, { transaction });
      }

      if (updateNotification) {
        NotificationService.updateNewsNotifications(news, {
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
}

module.exports = updateNews;

import { RedstoneRequest, RedstoneResponse } from '@Types';
import { News, Stack, sequelize } from '@Models';
import { RecordService, EventService, NotificationService, NewsService } from '@Services';
// import urlTrimmer = require('v2land-url-trimmer');

async function updateNews (req: RedstoneRequest, res: RedstoneResponse) {
  const id = +req.params.news;
  const data = req.body;

  let news = await News.findByPk(id);

  if (!news) {
    return res.status(404).json({
      message: '未找到该新闻',
    });
  }

  // if (data.url) {
  //   data.url = (await urlTrimmer.trim(data.url)).toString();
  // }

  const changes: any = {};
  for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status', 'comment', 'stackId', 'isInTemporaryStack']) {
    if (data[i] && data[i] !== (news as any)[i]) {
      changes[i] = data[i];
    }
  }

  if (Object.getOwnPropertyNames(changes).length === 0) {
    return res.status(200).json({
      message: '什么变化也没有发生',
      news,
    });
  }

  await sequelize.transaction(async transaction => {
    const changesCopy = { ...changes };
    const latestNews = await News.findOne({
      where: { eventId: news.eventId, status: 'admitted' },
      attributes: ['id'],
      order: [['time', 'DESC']],
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

      await EventService.updateAdmittedLatestNews(newNews.eventId, { transaction });

      NotificationService.notifyWhenNewsStatusChanged(news, newNews, req.session.clientId);

      if (beforeStatus === 'admitted' && changes.status !== 'admitted' && news.stackId) {
        const newsCount = await News.count({
          where: { stackId: news.stackId, status: 'admitted' },
        });
        if (!newsCount) {
          const stack = await Stack.findOne({
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
    const before: any = {};
    for (const i of Object.keys(changes)) {
      before[i] = (newNews as any)[i];
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

  NewsService.updateElasticsearchIndex({ newsId: id });
}

export default updateNews;

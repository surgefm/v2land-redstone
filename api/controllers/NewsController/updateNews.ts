import { RedstoneRequest, RedstoneResponse } from '@Types';
import { News, sequelize } from '@Models';
import { RecordService, EventService, NotificationService, NewsService } from '@Services';
// import urlTrimmer = require('v2land-url-trimmer');

async function updateNews(req: RedstoneRequest, res: RedstoneResponse) {
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

    let newNews = news;
    if (changes.status) {
      const beforeStatus = news.status;

      newNews = await news.update({
        status: changes.status,
      }, { transaction });
      await RecordService.create({
        model: 'News',
        action: 'updateNewsStatus',
        before: beforeStatus,
        data: changes.status,
        target: news.id,
        owner: req.session.clientId,
      }, { transaction });

      const events = await news.$get('events', {
        where: { status: 'admitted' },
        attributes: ['id'],
        transaction,
      });

      for (const event of events) {
        const latestNews = (await event.$get('news', {
          where: { status: 'admitted' },
          attributes: ['id'],
          order: [['time', 'DESC']],
          transaction,
        }))[0];

        const updateNotification =
          (latestNews && +latestNews.id === +news.id) ||
          (changesCopy.status && changesCopy.status !== news.status) ||
          (changesCopy.time && new Date(changesCopy.time).getTime() !== new Date(news.time).getTime());

        await EventService.updateAdmittedLatestNews(event.id, { transaction });

        if (updateNotification) {
          NotificationService.updateNewsNotifications(news, {
            force: data.forceUpdate,
          });
        }
      }

      NotificationService.notifyWhenNewsStatusChanged(news, newNews, req.session.clientId);

      if (beforeStatus === 'admitted' && changes.status !== 'admitted') {
        const stacks = await news.$get('stacks', {
          where: { status: 'admitted' },
        });
        for (const stack of stacks) {
          const newsCount = await stack.$count('news', {
            where: { status: 'admitted' },
            transaction,
          });
          if (!newsCount) {
            await stack.update({ status: 'invalid' }, { transaction });
            await RecordService.update({
              action: 'invalidateStack',
              data: { status: 'invalid' },
              before: { status: 'admitted' },
              model: 'Stack',
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
        model: 'News',
      }, { transaction });
    }

    res.status(201).json({
      message: '修改成功',
      news,
    });
  });

  NewsService.updateAlgoliaIndex({ newsId: id });
}

export default updateNews;

import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Stack, News, EventStackNews, sequelize } from '@Models';
import { RecordService } from '@Services';

async function addNews(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body || !req.body.news) {
    return res.status(400).json({
      message: '缺少参数：news。',
    });
  }

  const id = +req.params.stackId;
  const stack = await Stack.findByPk(id);
  if (!stack) {
    return res.status(404).json({
      message: '无法找到该进展',
    });
  }

  const newsId = req.body.news;
  const news = await News.findByPk(newsId);
  if (!news) {
    return res.status(404).json({
      message: '无法找到该新闻',
    });
  }

  let eventStackNews = await EventStackNews.findOne({
    where: {
      eventId: stack.eventId,
      stackId: stack.id,
      newsId: news.id,
    },
  });
  if (eventStackNews) {
    return res.status(200).json({
      message: '该新闻已在该进展中',
    });
  }

  await sequelize.transaction(async transaction => {
    const eventNews = await EventStackNews.findOne({
      where: {
        eventId: stack.eventId,
        newsId: news.id,
      },
    });
    const isInEvent = !!eventNews;

    const time = new Date();
    if (!isInEvent) {
      eventStackNews = await EventStackNews.create({
        eventId: stack.eventId,
        newsId: news.id,
      }, { transaction });

      await RecordService.create({
        model: 'EventStackNews',
        data: eventStackNews,
        target: stack.eventId,
        subtarget: news.id,
        owner: req.session.clientId,
        action: 'addNewsToEvent',
        createdAt: time,
      }, { transaction });

      eventStackNews = await EventStackNews.create({
        stackId: stack.id,
        newsId: news.id,
      }, { transaction });
    } else {
      if (eventNews.stackId) {
        await RecordService.destroy({
          model: 'EventStackNews',
          data: eventNews,
          target: eventNews.stackId,
          subtarget: news.id,
          owner: req.session.clientId,
          action: 'removeNewsFromStack',
        }, { transaction });
      }

      eventNews.stackId = stack.id;
      await eventNews.save({ transaction });
    }

    await RecordService.create({
      model: 'EventStackNews',
      data: eventStackNews,
      target: stack.id,
      subtarget: news.id,
      owner: req.session.clientId,
      action: 'addNewsToStack',
      createdAt: time,
    }, { transaction });
  });

  return res.status(201).json({
    message: '成功将新闻添加至进展中',
  });
}

export default addNews;

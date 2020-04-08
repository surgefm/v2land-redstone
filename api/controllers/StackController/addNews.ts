import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Stack, News, EventNews, StackNews, sequelize } from '@Models';
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

  let eventNews = await EventNews.findOne({
    where: {
      eventId: stack.eventId,
      newsId: news.id,
    },
  });
  if (eventNews) {
    return res.status(409).json({
      message: '该新闻已在进展所属事件中',
    });
  }

  let stackNews = await StackNews.findOne({
    where: {
      stackId: stack.id,
      newsId: news.id,
    },
  });
  if (stackNews) {
    return res.status(200).json({
      message: '该新闻已在该进展中',
    });
  }

  await sequelize.transaction(async transaction => {
    const time = new Date();
    eventNews = await EventNews.create({
      eventId: stack.eventId,
      newsId: news.id,
    }, { transaction });

    await RecordService.create({
      model: 'EventNews',
      data: eventNews,
      target: eventNews.id,
      owner: req.session.clientId,
      action: 'addNewsToEvent',
      createdAt: time,
    }, { transaction });

    stackNews = await StackNews.create({
      stackId: stack.id,
      newsId: news.id,
    }, { transaction });

    await RecordService.create({
      model: 'StackNews',
      data: stackNews,
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

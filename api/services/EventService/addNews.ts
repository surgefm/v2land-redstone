import { EventStackNews, News, sequelize } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';
import findEvent from './findEvent';

async function addNews(eventName: number | string, newsId: number, clientId: number) {
  const event = await findEvent(eventName, { eventOnly: true });
  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }
  const eventId = event.id as number;

  const news = await News.findByPk(newsId);
  if (!news) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该新闻');
  }

  let eventStackNews = await EventStackNews.findOne({
    where: {
      eventId: eventId,
      newsId: news.id,
    },
  });
  if (eventStackNews) {
    return null;
  }

  await sequelize.transaction(async transaction => {
    const time = new Date();
    eventStackNews = await EventStackNews.create({
      eventId,
      newsId: news.id,
    }, { transaction });

    await RecordService.create({
      model: 'EventStackNews',
      data: eventStackNews,
      target: eventId,
      subtarget: news.id,
      owner: clientId,
      action: 'addNewsToEvent',
      createdAt: time,
    }, { transaction });
  });

  return eventStackNews;
}

export default addNews;

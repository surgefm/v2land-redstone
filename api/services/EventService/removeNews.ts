import { EventStackNews, News, sequelize } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';
import * as StackService from '@Services/StackService';
import findEvent from './findEvent';

async function removeNews(eventName: number | string, newsId: number, clientId: number, time?: Date) {
  const event = await findEvent(eventName, { eventOnly: true });
  if (!event) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }
  const eventId = event.id as number;

  const news = await News.findByPk(newsId);
  if (!news) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该新闻');
  }

  const eventStackNews = await EventStackNews.findOne({
    where: {
      eventId: eventId,
      newsId: news.id,
    },
  });
  if (!eventStackNews) return;

  await sequelize.transaction(async transaction => {
    const t = time || new Date();
    if (eventStackNews.stackId) {
      await StackService.removeNews(eventStackNews.stackId, news.id, clientId, { transaction, time: t });
    }

    await RecordService.destroy({
      model: 'EventStackNews',
      data: eventStackNews,
      target: eventId,
      subtarget: news.id,
      owner: clientId,
      action: 'removeNewsFromEvent',
      createdAt: t,
      updatedAt: t,
    }, { transaction });
  });

  return eventStackNews;
}

export default removeNews;

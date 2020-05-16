import { Transaction } from 'sequelize';
import { EventStackNews, News, Stack } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';
import * as UtilService from '@Services/UtilService';

interface RemoveNewsOptions {
  transaction?: Transaction;
  time?: Date;
}

async function removeNews(stackId: number, newsId: number, clientId: number, { transaction, time }: RemoveNewsOptions = {}) {
  const stack = await Stack.findByPk(stackId, { transaction });
  if (!stack) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }

  const news = await News.findByPk(newsId, { transaction });
  if (!news) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该新闻');
  }

  const eventStackNews = await EventStackNews.findOne({
    where: {
      eventId: stack.eventId,
      stackId: stack.id,
      newsId: news.id,
    },
    transaction,
  });
  if (!eventStackNews) return;

  await UtilService.execWithTransaction(async transaction => {
    await RecordService.destroy({
      model: 'EventStackNews',
      data: eventStackNews,
      target: eventStackNews.stackId,
      subtarget: news.id,
      owner: clientId,
      action: 'removeNewsFromStack',
      createdAt: time,
      updatedAt: time,
    }, { transaction });

    eventStackNews.stackId = undefined;
    await eventStackNews.save({ transaction });
  }, transaction);

  return eventStackNews;
}

export default removeNews;

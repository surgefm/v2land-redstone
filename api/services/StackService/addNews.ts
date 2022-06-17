import { Client, EventStackNews, News, sequelize, Stack } from '@Models';
import { RedstoneError, ResourceNotFoundErrorType } from '@Types';
import * as RecordService from '@Services/RecordService';
import { getNewsroomSocket } from '@Services/EventService';

async function addNews(stackId: number, newsId: number, clientId: number) {
  const stack = await Stack.findByPk(stackId);
  if (!stack) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该进展');
  }

  const news = await News.findByPk(newsId);
  if (!news) {
    throw new RedstoneError(ResourceNotFoundErrorType, '无法找到该新闻');
  }

  let eventStackNews = await EventStackNews.findOne({
    where: {
      eventId: stack.eventId,
      stackId: stack.id,
      newsId: news.id,
    },
  });
  if (eventStackNews) {
    return null;
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
        owner: clientId,
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
          owner: clientId,
          action: 'removeNewsFromStack',
        }, { transaction });
      }

      eventNews.stackId = stack.id;
      await eventNews.save({ transaction });
      eventStackNews = eventNews;
    }

    await RecordService.create({
      model: 'EventStackNews',
      data: eventStackNews,
      target: stack.id,
      subtarget: news.id,
      owner: clientId,
      action: 'addNewsToStack',
      createdAt: time,
    }, { transaction });
  });

  const socket = await getNewsroomSocket(stack.eventId);
  socket.emit('add news to stack', {
    eventStackNews,
    stack,
    news,
    client: await Client.findByPk(clientId),
  });

  return eventStackNews;
}

export default addNews;

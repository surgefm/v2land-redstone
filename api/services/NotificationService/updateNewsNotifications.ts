import { Record, News, Event, Stack, Notification, sequelize } from '@Models';
import * as ModeService from '../ModeService';
import { Transaction } from 'sequelize';

async function updateNewsNotifications(
  news: News,
  { transaction, force = false }: {
    transaction?: Transaction;
    force?: boolean;
  } = {},
) {
  const latestNews = await News.findOne({
    where: {
      eventId: news.eventId,
      status: 'admitted',
    },
    order: [['time', 'DESC']],
    attributes: ['id'],
    transaction,
  });

  if (!force && (!latestNews || (+latestNews.id !== +news.id))) return;

  const recordCount = await Record.count({
    where: {
      model: 'News',
      target: news.id,
      action: 'notifyNewNews',
    },
    transaction,
  });

  if (!force && recordCount) return;

  let event = news.event;
  if (typeof event !== 'object') {
    event = await Event.findByPk(news.eventId, { transaction });
  }

  let stack = news.stack;
  if (typeof stack !== 'object') {
    stack = await Stack.findByPk(news.stackId, { transaction });
  }

  if (!transaction) {
    await sequelize.transaction(async transaction => {
      return updateNotifications(event, stack, news, transaction);
    });
  } else {
    return updateNotifications(event, stack, news, transaction);
  }
}

async function updateNotifications(event: Event, stack: Stack, news: News, transaction: Transaction) {
  const modes = ['new', '7DaysSinceLatestNews'];

  for (const mode of modes) {
    if (ModeService.getMode(mode).keepLatestOnly) {
      await Notification.update({
        status: 'discarded',
      }, {
        where: {
          eventId: event.id,
          mode,
        },
        transaction,
      });
    }
    await Notification.create({
      time: await ModeService.getMode(mode).new({ event, stack, news, transaction }),
      status: 'pending',
      mode,
    }, { transaction });
  }

  await Record.create({
    model: 'News',
    target: news.id,
    operation: 'create',
    action: 'notifyNewNews',
  }, { transaction });
}

export default updateNewsNotifications;

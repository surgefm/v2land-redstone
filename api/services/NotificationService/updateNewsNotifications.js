const SeqModels = require('../../../seqModels');

async function updateNewsNotifications(news, { transaction, force = false } = {}) {
  const latestNews = await SeqModels.News.findOne({
    where: {
      eventId: news.eventId,
      status: 'admitted',
    },
    sort: [['time', 'DESC']],
    attributes: ['id'],
  });

  if (!force && (!latestNews || (+latestNews.id !== +news.id))) return;

  const recordCount = await SeqModels.Record.count({
    model: 'News',
    target: news.id,
    action: 'notifyNewNews',
  });

  if (!force && recordCount) return;

  let event = news.event;
  if (typeof event !== 'object') {
    event = await SeqModels.Event.findById(news.eventId);
  }

  let stack = news.stack;
  if (typeof stack !== 'object') {
    stack = await SeqModels.Stack.findById(news.stackId);
  }

  if (!transaction) {
    await sequelize.transaction(async transaction => {
      return updateNotifications(event, stack, news, transaction);
    });
  } else {
    return updateNotifications(event, stack, news, transaction);
  }
}

async function updateNotifications(event, stack, news, transaction) {
  const modes = ['new', '7DaysSinceLatestNews'];

  for (const mode of modes) {
    if (ModeService[mode].keepLatestOnly) {
      await SeqModels.Notification.update({
        status: 'discarded',
      }, {
        where: {
          eventId: event.id,
          mode,
        },
        transaction,
      });
    }
    await SeqModels.Notification.create({
      time: await ModeService[mode].new({ event, stack, news, transaction }),
      status: 'pending',
      mode,
    }, { transaction });
  }

  await SeqModels.Record.create({
    model: 'News',
    target: news.id,
    operation: 'create',
    action: 'notifyNewNews',
  }, { transaction });
}

module.exports = updateNewsNotifications;

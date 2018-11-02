const SeqModels = require('../../seqModels');
const notifyWhenEventCreated = require('./NotificationService/notifyWhenEventCreated');
const notifyWhenEventStatusChanges = require('./NotificationService/notifyWhenEventStatusChanges');
const notifyWhenStackStatusChanges = require('./NotificationService/notifyWhenStackStatusChanges');
const updateStackNotifications = require('./NotificationService/updateStackNotifications');

const NotificationService = {

  getNextTime: async (mode, event) => {
    return ModeService[mode].new({ event });
  },

  notified: async (mode, event) => {
    return ModeService[mode].notified({ event });
  },

  updateForNewNews: async (event, news, force = false) => {
    const latestNews = await News.findOne({
      where: { event: event.id, status: 'admitted' },
      sort: 'time DESC',
    });

    if (!force && (!latestNews || (+latestNews.id !== +news.id))) return;

    const record = await Record.count({
      model: 'News',
      target: news.id,
      action: 'notifyNewNews',
    });

    if (record) return;

    const notificationCollection = await Notification.find({
      event: event.id,
      mode: ['new', '7DaysSinceLatestNews'],
    });

    for (const notification of notificationCollection) {
      const mode = ModeService[notification.mode];
      const time = await mode.update({ notification, event, latestNews });
      notification.time = time;
      notification.status = 'active';
      await notification.save();
    }

    await Record.create({
      model: 'News',
      target: news.id,
      operation: 'create',
      action: 'notifyNewNews',
    });

    return;
  },

  updateForNewStack: async (event, stack, force = false) => {
    const modeSet = ['EveryNewStack', '30DaysSinceLatestStack'];

    const latestStack = await SeqModels.Stack.findOne({
      where: {
        event: event.id,
        status: 'admitted',
        order: 1,
      },
      sort: 'order DESC',
    });

    if (!force && (!latestStack || (+latestStack.id !== +stack.id))) return;

    const record = await SeqModels.Record.count({
      model: 'Stack',
      target: stack.id,
      action: 'notifyNewStack',
    });

    if (record) return;

    await sequelize.transaction(async transaction => {
      for (const mode of modeSet) {
        await SeqModels.Notification.create({
          time: await ModeService[mode].new({ event, stack, transaction }),
          status: 'pending',
          mode,
          content: { event, stack },
        }, { transaction });
      }

      await SeqModels.Record.create({
        model: 'Stack',
        target: stack.id,
        operation: 'create',
        action: 'notifyNewStack',
      }, { transaction });
    });

    return;
  },

};

module.exports = {
  notifyWhenEventCreated,
  notifyWhenEventStatusChanges,
  notifyWhenStackStatusChanges,
  updateStackNotifications,
  ...NotificationService,
};

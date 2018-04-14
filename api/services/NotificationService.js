module.exports = {

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
    const latestStack = await Stack.findOne({
      where: { event: event.id, status: 'admitted' },
      sort: 'order DESC',
    });

    if (!force && (!latestStack || (+latestStack.id !== +stack.id))) return;

    const record = await Record.count({
      model: 'Stack',
      target: stack.id,
      action: 'notifyNewStack',
    });

    if (record) return;

    const notificationCollection = await Notification.find({
      event: event.id,
      mode: 'newStack',
    });

    for (const notification of notificationCollection) {
      const mode = ModeService[notification.mode];
      const time = await mode.update({ notification, event, latestStack });
      notification.time = time;
      notification.status = 'active';
      await notification.save();
    }

    await Record.create({
      model: 'Stack',
      target: stack.id,
      operation: 'create',
      action: 'notifyNewStack',
    });

    return;
  },

};

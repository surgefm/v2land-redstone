module.exports = {

  getNextTime: async (mode, event) => {
    return ModeService[mode].new(event);
  },

  notified: async (mode, event) => {
    return ModeService[mode].notified(event);
  },

  updateForNewNews: async (event, news, force = false) => {
    const latestNews = await News.findOne({
      where: { event: event.id, status: 'admitted' },
      sort: 'time DESC',
    });

    if (!force && (!latestNews || (+latestNews.id !== +news.id))) {
      return;
    }

    const notificationCollection = await Notification.find({
      event: event.id,
      mode: ['new', '7DaysSinceLatestNews'],
    });

    for (const notification of notificationCollection) {
      const mode = ModeService[notification.mode];
      const time = await mode.update(notification, event, latestNews);
      notification.time = time;
      notification.status = 'active';
      await notification.save();
    }

    return;
  },

};

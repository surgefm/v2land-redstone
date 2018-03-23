module.exports = {

  getNextTime: async (mode, event) => {
    return ModeService[mode].new(event);
  },

  updateForNewNews: async (event, news) => {
    const latestNews = await News.findOne({
      where: { event: event.id, status: 'admitted' },
      order: 'time DESC',
    });

    if (!latestNews || (latestNews.id.toString() !== news.id.toString())) {
      return;
    }

    const notificationCollection = await Notification.find({
      event: event.id,
      mode: ['new', '7DaysSinceLatestNews'],
    });

    for (const notification of notificationCollection) {
      const mode = ModeService[notification.mode];
      const time = await mode.update(notification, event, news);
      notification.time = time;
      notification.status = 'active';
      await notification.save();
    }

    return;
  },

};

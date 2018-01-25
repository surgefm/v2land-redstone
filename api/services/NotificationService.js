module.exports = {

  getNextTime: async (mode, event) => {
    return await ModeService[mode].new(event);
  },

  updateForNewNews: async (event, news) => {
    let latestNews = await News.findOne({
      where: { event: event.id, status: 'admitted' },
      order: 'time DESC',
    });

    if (!latestNews || (latestNews.id.toString() !== news.id.toString())) {
      return;
    }

    let notificationCollection = await Notification.find({
      event: event.id,
      mode: ['new', '7DaysSinceLatestNews'],
    });

    for (let notification of notificationCollection) {
      let mode = ModeService[notification.mode];
      let time = await mode.update(notification, event, news);
      notification.time = time;
      await notification.save();
    }

    return;
  },

};

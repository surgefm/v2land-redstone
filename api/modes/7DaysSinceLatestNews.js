const time = require('time');

const mode = {
  name: '七天未更新新闻',
  needNews: false,
  keepLatestOnly: true,
  new: async ({ event, news }) => {
    const latestNews = news || await News.findOne({
      where: { status: 'admitted', event: event.id },
      sort: 'time DESC',
    });

    if (!latestNews) {
      return new Date('1/1/3000');
    } else {
      const date = new time.Date(latestNews.time, 'Asia/Shanghai');
      date.setHours(8);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setDate(date.getDate() + 7);

      return date - Date.now() < 0 ? new Date('1/1/3000') : date;
    }
  },
  update: async ({ notification, event, news }) => {
    return mode.new({ event, news });
  },
  notified: async () => {
    return new Date('1/1/3000');
  },
  getTemplate: async ({ notification, event, news }) => {
    return {
      subject: `${event.name} 已有七天没有消息`,
      message: `${event.name} 已有七天没有消息，快去看看有什么新的进展。`,
      button: '点击按钮查看事件',
      url: `${sails.config.globals.site}/${event.id}`,
    };
  },
};

module.exports = mode;

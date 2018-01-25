const time = require('time');

let modeCollection = {

  'new': {
    new: async (event) => {
      return new Date('1/1/3000');
    },
    update: async (notification, event, news) => {
      if (!news.newNotification) {
        news.newNotification = true;
        await news.save();
        return new Date('1/1/2000');
      } else {
        return new Date('1/1/3000');
      }
    },
    notified: async () => {
      return new Date('1/1/3000');
    },
    getTemplate: async (notification, event, news) => {
      return {
        subject: `${event.name} 有了新的消息`,
        message: `${news.source} 发布了关于 ${event.name} 的新消息：「${news.abstract}」`,
        button: '点击按钮查看新闻',
        url: `${sails.config.globals.site}${event.id}?news=${news.id}`,
      };
    },
  },

  '7DaysSinceLatestNews': {
    new: async (event) => {
      let newsCollection = await News.find({
        where: { status: 'admitted', event: event.id },
        order: 'time DESC',
      });

      if (newsCollection.length === 0) {
        return new Date('1/1/3000');
      } else {
        let date = new time.Date(newsCollection[0].time, 'Asia/Shanghai');
        date.setHours(8);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setDate(date.getDate() + 7);

        return date - Date.now() < 0 ? new Date('1/1/3000') : date;
      }
    },
    update: async (notification, event, news) => {
      return await modeCollection['7DaysSinceLatestNews'].new(event);
    },
    notified: async () => {
      return new Date('1/1/3000');
    },
    getTemplate: async (notification, event, news) => {
      return {
        subject: `${event.name} 已有七天没有消息`,
        message: `${event.name} 已有七天没有消息，快去看看有什么新的进展。`,
        button: '点击按钮查看事件',
        url: `${sails.config.globals.site}/${event.id}`,
      };
    },
  },

  'daily': {
    new: async () => {
      let date = new time.Date();

      date.setTimezone('Asia/Shanghai');
      date.setHours(8);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setDate(date.getDate() + 1);

      return date;
    },
    notified: async () => {
      return await modeCollection.daily.new();
    },
    getTemplate: async (notification, event, news) => {
      return {
        subject: `${event.name} 发来了每日一次的定时提醒`,
        message: `${event.name} 发来了每日一次的定时提醒，快去看看有什么新的进展。`,
        button: '点击按钮查看事件',
        url: `${sails.config.globals.site}/${event.id}`,
      };
    },
  },

  'weekly': {
    new: async () => {
      let date = new time.Date();

      date.setTimezone('Asia/Shanghai');
      date.setHours(8);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setDate(date.getDate() + 7);

      return date;
    },
    notified: async () => {
      return await modeCollection.weekly.new();
    },
    getTemplate: async (notification, event, news) => {
      return {
        subject: `${event.name} 发来了每周一次的定时提醒`,
        message: `${event.name} 发来了每周一次的定时提醒，快去看看有什么新的进展。`,
        button: '点击按钮查看事件',
        url: `${sails.config.globals.site}/${event.id}`,
      };
    },
  },

  'monthly': {
    new: async () => {
      let date = new time.Date();

      date.setTimezone('Asia/Shanghai');
      date.setHours(8);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMonth(date.getMonth() + 1);

      return date;
    },
    notified: async () => {
      return await modeCollection.monthly.new();
    },
    getTemplate: async (notification, event, news) => {
      return {
        subject: `${event.name} 发来了每月一次的定时提醒`,
        message: `${event.name} 发来了每月一次的定时提醒，快去看看有什么新的进展。`,
        button: '点击按钮查看事件',
        url: `${sails.config.globals.site}/${event.id}`,
      };
    },
  },

};

module.exports = modeCollection;

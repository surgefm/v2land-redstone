const time = require('time');

const mode = {
  name: '每周一次的定时提醒',
  needNews: false,
  isInterval: true,
  new: async () => {
    const date = new time.Date();

    date.setTimezone('Asia/Shanghai');
    date.setHours(8);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 7);

    return date;
  },
  notified: async () => {
    return mode.new();
  },
  getTemplate: async ({ notification, event, news }) => {
    return {
      subject: `${event.name} 发来了每周一次的定时提醒`,
      message: `${event.name} 发来了每周一次的定时提醒，快去看看有什么新的进展。`,
      button: '点击按钮查看事件',
      url: `${sails.config.globals.site}/${event.id}`,
    };
  },
};

module.exports = mode;

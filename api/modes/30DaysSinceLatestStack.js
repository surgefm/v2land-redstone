const time = require('time');
const seqModels = require('../../seqModels');

const mode = {
  name: '三十天未更新新闻',
  needNews: false,
  new: async ({ event, stack, transaction }) => {
    const latestStack = stack || await seqModels.Stack.findOne({
      where: {
        status: 'admitted',
        event: event.id,
        order: 0,
      },
      order: sequelize.literal('time DESC'),
      transaction,
    });

    if (!latestStack) {
      return new Date('1/1/3000');
    } else {
      const date = new time.Date(latestStack.time, 'Asia/Shanghai');
      date.setHours(20);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setDate(date.getDate() + 30);

      return date - Date.now() < 0 ? new Date('1/1/3000') : date;
    }
  },
  notified: async () => {
    return new Date('1/1/3000');
  },
  getTemplate: async ({ notification, event, stack }) => {
    return {
      subject: `${event.name} 已有七天没有消息`,
      message: `${event.name} 已有七天没有消息，快去看看有什么新的进展。`,
      button: '点击按钮查看事件',
      url: `${sails.config.globals.site}/${event.id}`,
    };
  },
};

module.exports = mode;

const time = require('time');

const mode = {
  needNews: false,
  new: async () => {
    const date = new time.Date();

    date.setTimezone('Asia/Shanghai');
    date.setHours(20);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 7 + (5 - date.getDay()));

    return date;
  },
  notified: async () => {
    return mode.new();
  },
  getTemplate: async ({ notification, event, stack }) => {
    if (!event) {
      if (!notification) {
        throw new MissingParameterError('notification');
      }
      event = notification.event;
    }

    if (typeof event === 'number') {
      event = await SeqModels.Event.findOne({
        where: { id: event },
      });
    }

    if (!stack) {
      stack = await SeqModels.Stack.findOne({
        where: {
          event: event.id,
          status: 'admitted',
          order: { [Op.gte]: 0 },
        },
        order: [['order', ASC]],
      });
    }

    let message = `${event.name} 发来了每周五的定时提醒，`;
    message += stack
      ? `它的最新进展为 ${stack.title}。`
      : '该事件至今尚无进展。';

    return {
      subject: `${event.name} 发来了每周五的定时提醒`,
      message,
      button: '点击按钮查看事件',
      url: `${sails.config.globals.site}/${event.id}`,
    };
  },
};

module.exports = mode;

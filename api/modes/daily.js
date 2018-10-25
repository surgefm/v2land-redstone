const time = require('time');
const SeqModels = require('../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { MissingParameterError } = require('../../utils/errors');

const mode = {
  name: '每日一次的定时提醒',
  needNews: false,
  new: async () => {
    const date = new time.Date();

    date.setTimezone('Asia/Shanghai');
    date.setHours(20);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setDate(date.getDate() + 1);

    return date;
  },
  notified: async (inputs) => {
    return mode.new(inputs);
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

    let message = `${event.name} 发来了每日一次的定时提醒，`;
    message += stack
      ? `它的最新进展为 ${stack.title}。`
      : '该事件至今尚无进展。';

    return {
      subject: `${event.name} 发来了每日一次的定时提醒`,
      message,
      button: '点击按钮查看事件',
      url: `${sails.config.globals.site}/${event.id}`,
    };
  },
};

module.exports = mode;

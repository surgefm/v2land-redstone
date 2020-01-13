const SeqModels = require('../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { MissingParameterError } = require('../../utils/errors');

module.exports = {
  name: '新的事件进展',
  needStack: true,
  new: async () => {
    return new Date('1/1/2000');
  },
  notified: async () => {
    return new Date('1/1/3000');
  },
  getTemplate: async ({ notification, event, stack }) => {
    if (!event) {
      if (!notification) {
        throw new MissingParameterError('notification');
      }
      event = notification.eventId;
    }

    if (typeof event === 'number') {
      event = await SeqModels.Event.findById(event);
    }

    if (!stack) {
      stack = await SeqModels.Stack.findOne({
        where: {
          eventId: event.id,
          status: 'admitted',
          order: { [Op.gte]: 0 },
        },
        order: [['order', 'DESC']],
      });
    }

    return {
      subject: `${event.name} 有了新的进展`,
      message: `${event.name} 最新进展：「${stack.title}」`,
      button: '点击按钮查看进展',
      url: `${sails.config.globals.site}/${event.id}/${stack.id}`,
    };
  },
};

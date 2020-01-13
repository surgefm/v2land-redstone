import { Event, Stack } from '@Models';
import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';
import { MissingParameterError } from '@Utils/errors';
import { Op } from 'sequelize';

class EveryNewStackMode extends NotificationMode {
  name: 'EveryNewStack';
  nickname: '新的事件进展';
  needStack: true;

  async new () {
    return new Date('1/1/2000');
  }

  async notified () {
    return new Date('1/1/3000');
  }

  async getTemplate ({ notification, event, eventId, stack }: NotificationModeInput) {
    if (!event && !eventId) {
      if (!notification) {
        throw new MissingParameterError('notification');
      }
      eventId = notification.eventId;
    }

    if (typeof eventId === 'number') {
      event = await Event.findByPk(eventId);
    }

    if (!stack) {
      stack = await Stack.findOne({
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
      url: `${globals.site}/${event.id}/${stack.id}`,
    };
  }
}

export default EveryNewStackMode;

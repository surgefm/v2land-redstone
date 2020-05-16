import { Event, Stack } from '@Models';
import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';
import { MissingParameterError } from '@Utils/errors';
import { Op } from 'sequelize';
import moment from 'moment-timezone';

export class EveryFridayMode extends NotificationMode {
  name = 'EveryFriday';
  nickname = '每周五定时提醒';
  needNews = false;
  isInterval = true;

  async new() {
    const date = moment(new Date).tz('Asia/Shanghai');

    date.hour(20);
    date.minute(0);
    date.second(0);
    date.date(date.date() + 7 + (5 - date.day()));

    return date.toDate();
  }

  async notified() {
    return this.new();
  }

  async getTemplate({ notification, event, eventId, stack }: NotificationModeInput) {
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

    let message = `${event.name} 发来了每周五的定时提醒，`;
    message += stack
      ? `它的最新进展为 ${stack.title}。`
      : '该事件至今尚无进展。';

    return {
      subject: `${event.name} 发来了每周五的定时提醒`,
      message,
      button: '点击按钮查看事件',
      url: `${globals.site}/${event.id}`,
    };
  }
}

export default new EveryFridayMode();

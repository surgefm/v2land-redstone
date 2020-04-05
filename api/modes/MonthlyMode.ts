import { Event, Stack } from '@Models';
import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';
import { MissingParameterError } from '@Utils/errors';
import { Op } from 'sequelize';
import moment from 'moment-timezone';

class MonthlyMode extends NotificationMode {
  name: 'monthly';
  nickname: '每月一次的定时提醒';
  needNews: false;
  isInterval: true;

  async new() {
    const date = moment(new Date).tz('Asia/Shanghai');

    date.hour(20);
    date.minute(0);
    date.second(0);
    date.date(1);
    date.month(date.month() + 1);

    return date.toDate();
  }

  async notified() {
    return this.new();
  }

  async getTemplate ({ notification, event, stack }: NotificationModeInput) {
    if (!event) {
      if (!notification) {
        throw new MissingParameterError('notification');
      }
      event = notification.event;
    }

    if (typeof event === 'number') {
      event = await Event.findOne({
        where: { id: event },
      });
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

    let message = `${event.name} 发来了每月一次的定时提醒，`;
    message += stack
      ? `它的最新进展为 ${stack.title}。`
      : '该事件至今尚无进展。';

    return {
      subject: `${event.name} 发来了每月一次的定时提醒`,
      message,
      button: '点击按钮查看事件',
      url: `${globals.site}/${event.id}`,
    };
  }
}

export default MonthlyMode;

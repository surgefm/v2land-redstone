import { Stack } from '@Models';
import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';
import moment from 'moment-timezone';
import { Op } from 'sequelize';

class ThirtyDaysSinceLatestStackMode extends NotificationMode {
  name: '30DaysSinceLatestStack';
  nickname: '三十天未更新进展';
  keepLatestOnly: true;

  async new({ event, stack }: NotificationModeInput) {
    const latestStack = stack || await Stack.findOne({
      where: {
        eventId: event.id,
        status: 'admitted',
        order: { [Op.gte]: 0 },
      },
      order: [['order', 'DESC']],
    });

    if (!latestStack) {
      return new Date('1/1/3000');
    } else {
      const date = moment(new Date()).tz('Asia/Shanghai');
      date.hour(20);
      date.minute(0);
      date.second(0);
      date.date(date.date() + 30);

      const d = date.toDate();
      return d.getTime() - Date.now() < 0 ? new Date('1/1/3000') : d;
    }
  }

  async notified () {
    return new Date('1/1/3000');
  }

  async getTemplate ({ event }: NotificationModeInput) {
    return {
      subject: `${event.name} 已有七天没有消息`,
      message: `${event.name} 已有七天没有消息，快去看看有什么新的进展。`,
      button: '点击按钮查看事件',
      url: `${globals.site}/${event.id}`,
    };
  }
}

export default ThirtyDaysSinceLatestStackMode;

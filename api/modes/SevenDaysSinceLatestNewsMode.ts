import { News } from '@Models';
import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';
import moment from 'moment-timezone';

export class SevenDaysSinceLatestNewsMode extends NotificationMode {
  name = '7DaysSinceLatestNews';
  nickname = '七天未更新新闻';
  needNews = false;
  keepLatestOnly = true;

  async new({ event, news }: NotificationModeInput) {
    const latestNews = news || await News.findOne({
      where: { status: 'admitted', eventId: event.id },
      order: [['time', 'DESC']],
    });

    if (!latestNews) {
      return new Date('1/1/3000');
    } else {
      const date = moment(new Date()).tz('Asia/Shanghai');
      date.hour(8);
      date.minute(0);
      date.second(0);
      date.date(date.date() + 7);

      const d = date.toDate();
      return d.getTime() - Date.now() < 0 ? new Date('1/1/3000') : d;
    }
  }

  async update({ event, news }: NotificationModeInput) {
    return this.new({ event, news });
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

export default new SevenDaysSinceLatestNewsMode();

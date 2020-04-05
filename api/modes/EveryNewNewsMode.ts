import { NotificationMode, NotificationModeInput } from '@Types';
import { globals } from '@Configs';

export class EveryNewNewsMode extends NotificationMode {
  name = 'new';
  nickname = '新的新闻报道';
  needNews = true;
  isInterval = false;

  async new() {
    return new Date('1/1/3000');
  }

  async update() {
    return new Date('1/1/2000');
  }

  async notified() {
    return new Date('1/1/3000');
  }

  async getTemplate ({ event, news }: NotificationModeInput) {
    return {
      subject: `${event.name} 有了新的消息`,
      message: `${news.source} 发布了关于 ${event.name} 的新消息：「${news.abstract}」`,
      button: '点击按钮查看新闻',
      url: `${globals.site}/${event.id}?news=${news.id}`,
    };
  }
}

export default new EveryNewNewsMode();

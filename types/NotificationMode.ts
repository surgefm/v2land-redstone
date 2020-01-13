import { Event, News, Stack, Notification } from '@Models';

interface NotificationModeInput {
  notification?: Notification;
  event?: Event;
  eventId?: number;
  stack?: Stack;
  stackId?: number;
  news?: News;
  newsId?: number;
}

abstract class NotificationMode {
  name: string;
  nickname: string;
  needNews: boolean;
  needStack: boolean;
  isInterval: boolean;
  keepLatestOnly: boolean = false;

  abstract async new(input?: NotificationModeInput): Promise<Date>;

  async update(input?: NotificationModeInput): Promise<Date> {
    return null;
  };

  abstract async notified(input?: NotificationModeInput): Promise<Date>;

  abstract async getTemplate(input?: NotificationModeInput): Promise<{
    subject: string;
    message: string;
    button: string;
    url: string;
  }>
}

export { NotificationMode, NotificationModeInput };
export default NotificationMode;

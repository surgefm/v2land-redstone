/**
 * 向用户的移动设备发布推送
 */
import { Contact, Subscription } from '@Models';
import { LeanCloudService, UtilService } from '@Services';
import * as pino from 'pino';
const logger = pino();

async function notifyByMobileAppNotification({ contact, subscription, template }: {
  contact: Contact,
  subscription: Subscription,
  template: any,
}) {
  if (!contact) {
    subscription.status = 'failed';
    await subscription.save();
    return logger.error(new Error(`未找到用户 ${subscription.subscriber} 的 App 绑定`));
  }

  const message = UtilService.shortenString(template.message, 100);
  return LeanCloudService.pushNotification(contact.profileId, {
    alert: {
      'title': '你关注的事件有了新动态',
      'body': message,
      'content-available': 1,
      'thread-id': subscription.eventId,
    },
    badge: 'Increment',
    eventId: subscription.eventId,
  });
}

export default notifyByMobileAppNotification;

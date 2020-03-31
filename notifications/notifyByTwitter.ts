/**
 * 使用用户的绑定 Twitter 账号发布推文
 */
import { Contact, Subscription } from '@Models';
import { UtilService, TwitterService } from '@Services';
import * as pino from 'pino';
const logger = pino();

async function notifyByTwitter({ contact, subscription, template }: {
  contact: Contact,
  subscription: Subscription,
  template: any,
}) {
  if (!contact) {
    subscription.status = 'failed';
    await subscription.save();
    return logger.error(new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`));
  }

  let message = UtilService.shortenString(template.message, 100);
  message += ' ' + template.url + ' #浪潮';
  return TwitterService.tweet(contact.auth, message);
}

export default notifyByTwitter;

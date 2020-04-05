/**
 * 使用用户的绑定新浪账号发布微博
 */
import { Contact, Subscription } from '@Models';
import { UtilService, WeiboService } from '@Services';
import disableSubscription from './disableSubscription';
import pino from 'pino';
const logger = pino();

async function notifyByWeibo({ contact, subscription, template }: {
  contact: Contact;
  subscription: Subscription;
  template: any;
}) {
  if (!contact) {
    await disableSubscription(subscription);
    return logger.error(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
  }

  const message = UtilService.shortenString(template.message, 100)
    + ' ' + template.url;
  return WeiboService.post(contact.auth, message);
}

export default notifyByWeibo;

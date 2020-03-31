/**
 * 使用浪潮的绑定账号发布微博并 @ 用户
 */
import { Contact, Subscription, Auth } from '@Models';
import { UtilService, WeiboService } from '@Services';
import { globals } from '@Configs';
import * as pino from 'pino';
const logger = pino();
import disableSubscriptionMethod from './disableSubscriptionMethod';

async function notifyByWeiboAt({ contact, subscription, template }: {
  contact: Contact,
  subscription: Subscription,
  template: any,
}) {
  if (!globals.officialAccount.weibo) {
    return logger.error(new Error('未配置官方微博账号'));
  }

  let profileId = globals.officialAccount.weibo;
  profileId = typeof (profileId) === 'object'
    ? profileId[Math.floor(Math.random() * profileId.length)]
    : profileId;

  const auth = await Auth.findOne({
    where: {
      site: 'weibo',
      profileId,
    },
  });

  if (!auth) {
    return logger.error(new Error(`未找到浪潮微博 ${profileId} 的绑定`));
  }

  if (!contact.auth) return disableSubscriptionMethod(subscription);

  let message = '@' + contact.auth.profile.screen_name + ' ';
  message += UtilService.shortenString(template.message, 96);
  message += ' ' + UtilService.generateRandomV2landString(4);
  message += ' ' + template.url;

  return WeiboService.post(auth, message);
}

export default notifyByWeiboAt;

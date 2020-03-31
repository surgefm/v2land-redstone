/**
 * 使用浪潮的绑定账号发布推文并 @ 用户
 */
import { Contact, Subscription, Auth } from '@Models';
import { UtilService, TwitterService } from '@Services';
import { globals } from '@Configs';
import disableSubscriptionMethod from './disableSubscriptionMethod';
import * as pino from 'pino';
const logger = pino();

async function notifyByTwitterAt({ contact, subscription, template }: {
  contact: Contact,
  subscription: Subscription,
  template: any,
}) {
  if (!globals.officialAccount.twitter) {
    return logger.error(new Error('未配置官方 Twitter 账号'));
  }

  let profileId = globals.officialAccount.twitter;
  profileId = typeof(profileId) === 'object'
    ? profileId[Math.floor(Math.random() * profileId.length)]
    : profileId;

  const auth = await Auth.findOne({
    where: {
      site: 'twitter',
      profileId,
    },
  });

  if (!auth) {
    return logger.error(new Error(`未找到浪潮 Twitter ${profileId} 的绑定`));
  }

  if (!contact.auth) return disableSubscriptionMethod(subscription);

  let message = '@' + contact.auth.profile.screen_name + ' ';
  message += UtilService.shortenString(template.message, 100);
  message += ' ' + template.url + ' #浪潮';
  return TwitterService.tweet(auth, message);
}

export default notifyByTwitterAt;

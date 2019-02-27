/**
 * 使用浪潮的绑定账号发布推文并 @ 用户
 */
const disableSubscriptionMethod = require('./disableSubscriptionMethod');

async function notifyByTwitterAt({ contact, subscription, template }) {
  if (!sails.config.globals.officialAccount.twitter) {
    return sails.log.error(new Error('未配置官方 Twitter 账号'));
  }

  let profileId = sails.config.globals.officialAccount.twitter;
  profileId = typeof(profileId) === 'object'
    ? profileId[Math.floor(Math.random() * profileId.length)]
    : profileId;

  const auth = await SeqModels.Auth.findOne({
    where: {
      site: 'twitter',
      profileId,
    },
  });

  if (!auth) {
    return sails.log.error(new Error(`未找到浪潮 Twitter ${profileId} 的绑定`));
  }

  if (!subscription.contact.twitter) return disableSubscriptionMethod(subscription);
  if (!contact.auth) return disableSubscriptionMethod(subscription);

  let message = '@' + contact.auth.profile.screen_name + ' ';
  message += UtilService.shortenString(template.message, 100);
  message += ' ' + template.url + ' #浪潮';
  return TwitterService.tweet(auth, message);
}

module.exports = notifyByTwitterAt;

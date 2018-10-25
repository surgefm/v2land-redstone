/**
 * 使用浪潮的绑定账号发布推文并 @ 用户
 */
const SeqModels = require('../seqModels');

async function notifyByTwitterAt(subscription, template) {
  if (!sails.config.globals.officialAccount.twitter) {
    return sails.log.error(new Error('未配置官方 Twitter 账号'));
  }

  let profileId = sails.config.globals.officialAccount.twitter;
  profileId = typeof(profileId) === 'object'
    ? profileId[Math.floor(Math.random() * profileId.length)]
    : profileId;

  const auth = await SeqModels.auth.findOne({
    where: {
      site: 'twitter',
      profileId,
    },
  });

  if (!auth) {
    return sails.log.error(new Error(`未找到浪潮 Twitter ${profileId} 的绑定`));
  }

  if (!subscription.contact.twitter) return disableSubscription(subscription);
  const client = await Model.auth.findOne({ id: subscription.contact.twitter });
  if (!client) return disableSubscription(subscription);

  let message = '@' + client.profile.screen_name + ' ';
  message += (template.message.length > 100
    ? (template.message.slice(0, 100) + '... ')
    : (template.message + ' '))
    + template.url + ' #浪潮';
  return TwitterService.tweet(auth, message);
}

module.exports = notifyByTwitterAt;
/**
 * 使用浪潮的绑定账号发布微博并 @ 用户
 */
const SeqModels = require('../seqModels');

async function notifyByWeiboAt(subscription, template) {
  if (!sails.config.globals.officialAccount.weibo) {
    return sails.log.error(new Error('未配置官方微博账号'));
  }

  let profileId = sails.config.globals.officialAccount.weibo;
  profileId = typeof (profileId) === 'object'
    ? profileId[Math.floor(Math.random() * profileId.length)]
    : profileId;

  const auth = await SeqModels.Auth.findOne({
    where: {
      site: 'weibo',
      profileId,
    },
  });

  if (!auth) {
    return sails.log.error(new Error(`未找到浪潮微博 ${profileId} 的绑定`));
  }

  if (!subscription.contact.weibo) return disableSubscription(subscription);
  const client = await Model.auth.findOne({ id: subscription.contact.weibo });
  if (!client) return disableSubscription(subscription);

  let message = '@' + client.profile.screen_name + ' ';
  message += template.message.length > 100
    ? (template.message.slice(0, 100) + '...')
    : (template);
  message += ' ' + UtilService.generateRandomV2landString(4);
  message += template.url;

  return WeiboService.post(auth, message);
}

module.exports = notifyByWeiboAt;

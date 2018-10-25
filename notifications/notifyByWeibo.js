/**
 * 使用用户的绑定新浪账号发布微博
 */
const SeqModels = require('../seqModels');

async function notifyByWeibo(subscription, template) {
  const contact = await SeqModels.Contact.findOne({
    where: {
      type: 'weibo',
      status: 'active',
      owner: subscription.subscriber,
    },
    include: [SeqModels.Auth],
  });

  if (!contact) {
    await disableSubscription(subscription);
    return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
  }

  const message = UtilService.shortenString(template.message, 100)
    + ' ' + template.url;
  return WeiboService.post(contact.auth, message);
}

module.exports = notifyByWeibo;

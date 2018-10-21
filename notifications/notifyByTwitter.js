/**
 * 使用用户的绑定 Twitter 账号发布推文
 */
const SeqModels = require('../seqModels');

async function notifyByTwitter(subscription, template) {
  const contact = await SeqModels.Contact.findOne({
    where: {
      type: 'twitter',
      status: 'active',
      owner: subscription.subscriber,
    },
    include: [{
      model: SeqModels.Auth,
    }],
  });

  if (!contact) {
    subscription.status = 'failed';
    await subscription.save();
    return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`));
  }

  let message = template.message.length > 100
    ? (template.message.slice(0, 100) + '... ')
    : (template.message + ' ');
  message += template.url + ' #浪潮';
  return TwitterService.tweet(contact.auth, message);
}

module.exports = notifyByTwitter;

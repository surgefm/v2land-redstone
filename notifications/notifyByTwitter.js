/**
 * 使用用户的绑定 Twitter 账号发布推文
 */
async function notifyByTwitter({ contact, subscription, template }) {
  if (!contact) {
    subscription.status = 'failed';
    await subscription.save();
    return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`));
  }

  let message = UtilService.shortenString(template.message, 100);
  message += ' ' + template.url + ' #浪潮';
  return TwitterService.tweet(contact.auth, message);
}

module.exports = notifyByTwitter;

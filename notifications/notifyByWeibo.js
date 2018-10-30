/**
 * 使用用户的绑定新浪账号发布微博
 */
async function notifyByWeibo({ contact, subscription, template }) {
  if (!contact) {
    await disableSubscription(subscription);
    return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
  }

  const message = UtilService.shortenString(template.message, 100)
    + ' ' + template.url;
  return WeiboService.post(contact.auth, message);
}

module.exports = notifyByWeibo;

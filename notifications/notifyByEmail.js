/**
 * 发送邮件推送
 */
async function notifyByEmail(subscription, template) {
  return EmailService.notify(subscription, template);
}

module.exports = notifyByEmail;

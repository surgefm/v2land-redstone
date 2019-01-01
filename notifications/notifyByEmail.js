/**
 * 发送邮件推送
 */
async function notifyByEmail({ contact, subscription, template }) {
  return EmailService.notify(contact.profileId, subscription, template);
}

module.exports = notifyByEmail;

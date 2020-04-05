/**
 * 发送邮件推送
 */
import { Contact, Subscription } from '@Models';
import { EmailService } from '@Services';

async function notifyByEmail({ contact, subscription, template }: {
  contact: Contact;
  subscription: Subscription;
  template: any;
}) {
  return EmailService.notify(contact.profileId, subscription, template);
}

export default notifyByEmail;

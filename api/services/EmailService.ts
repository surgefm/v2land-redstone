import { SendMailOptions } from 'nodemailer';
import { Client, Subscription } from '@Models';
import { email as emailConfig, globals } from '@Configs';

const transporter = emailConfig.transporter;
import qs from 'qs';
import delay from 'delay';

/**
 * wrapper for transporter.sendMail
 * @param {string} email
 */
async function sendEmail(email: SendMailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(email, (err, message) => {
      if (err) return reject(err);
      resolve(message);
    });
  });
}

export async function send (email: SendMailOptions): Promise<any> {
  if (!transporter) return;
  if (transporter.isIdle()) {
    return sendEmail(email);
  } else {
    await delay(500);
    return send(email);
  }
}

export async function register (client: Client, token: string) {
  const email = {
    to: client.email,
    from: {
      name: '浪潮 V2Land',
      address: 'verify@langchao.org',
    },
    template: 'registration',
    subject: client.username + '，请完成浪潮注册过程',
    context: {
      username: client.username,
      url: globals.site + '/verify?' +
        qs.stringify({
          id: '' + client.id,
          token,
        }),
    },
  };

  return send(email);
}

export async function notify (address: string, subscription: Subscription, template: any) {
  template.unsubscribe = `${globals.api}/subscription/unsubscribe?` +
    `id=${ subscription.id }` +
    `&unsubscribeId=${ subscription.unsubscribeId }`;

  const email = {
    from: {
      name: '浪潮 V2Land',
      address: 'notify@langchao.org',
    },
    to: address,
    subject: template.subject,
    template: 'notification',
    context: template,
  };

  return send(email);
}

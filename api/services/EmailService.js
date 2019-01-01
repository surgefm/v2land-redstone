const transporter = sails.config.email.transporter;
const qs = require('qs');

/**
 * wrapper for transporter.sendMail
 * @param {string} email
 */
async function sendEmail(email) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(email, (err, message) => {
      if (err) return reject(err);
      resolve(message);
    });
  });
}


/**
 * wrapper for setTimeout
 * @param {number} time
 */
async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const EmailService = {

  register: async (client, token) => {
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
        url: sails.config.globals.site + '/verify?' +
          qs.stringify({
            id: '' + client.id,
            token,
          }),
      },
    };

    return EmailService.send(email);
  },

  notify: async (address, subscription, template) => {
    template.unsubscribe = `${sails.config.globals.api}/subscription/unsubscribe?` +
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

    return EmailService.send(email);
  },

  send: async (email) => {
    if (!transporter) return;
    if (transporter.isIdle()) {
      return sendEmail(email);
    } else {
      await sleep(500);
      return EmailService.send(email);
    }
  },

};

module.exports = EmailService;

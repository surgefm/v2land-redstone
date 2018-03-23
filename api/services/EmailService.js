const transporter = sails.config.email.transporter;

const EmailService = {

  register: async (client) => {
    const email = {
      to: client.email,
      from: {
        name: '浪潮',
        address: 'verify@langchao.co',
      },
      template: 'registration',
      subject: client.username + '，请完成浪潮注册过程',
      context: {
        username: client.username,
        url: sails.config.globals.api + '/client/confirm?' +
          qs.stringify({
            uid: '' + client.id,
            redirect: sails.config.globals.api + '/client/verified',
            token: client.verificationToken,
          }),
      },
    };

    transporter.on('idle', () => {
      return transporter.sendMail(email);
    });
  },

  notify: async (subscription, template) => {
    template.unsubscribe = `${sails.config.globals.api}/subscription/unsubscribe?` +
      `id=${ subscription.id }` +
      `&unsubscribeId=${ subscription.unsubscribeId }`;

    const email = {
      from: {
        name: '浪潮',
        address: 'notify@langchao.co',
      },
      to: subscription.contact.email,
      subject: template.subject,
      template: 'notification',
      context: template,
    };

    transporter.on('idle', () => {
      return transporter.sendMail(email);
    });
  },

};

module.exports = EmailService;

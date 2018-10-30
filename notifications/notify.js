/**
 * 发出推送
 */
const SeqModels = require('../seqModels');
const notifyByEmail = require('./notifyByEmail');
const notifyByEmailDailyReport = require('./notifyByEmailDailyReport');
const notifyByTwitter = require('./notifyByTwitter');
const notifyByTwitterAt = require('./notifyByTwitterAt');
const notifyByWeibo = require('./notifyByWeibo');
const notifyByWeiboAt = require('./notifyByWeiboAt');

async function notify(notification) {
  const { event } = notification; // Event must be an object.
  const mode = ModeService[notification.mode];
  let news;
  let stack;
  if (mode.needNews) {
    news = SeqModels.News.findOne({
      where: {
        event: notification.event,
        status: 'admitted',
      },
      order: [['time', 'DESC']],
    });
    if (!news) return;
  }

  if (mode.needStack) {
    stack = SeqModels.Stack.findOne({
      where: {
        event: notification.event,
        order: { [Op.gte]: 0 },
      },
      order: [['order', 'DESC']],
    });
    if (!stack) return;
  }

  const template = await mode.getTemplate({
    notification,
    event,
    news: news, // news and stack may be undefined in some cases.
    stack: stack,
  });

  const notificationData = notification.get({ plain: true });
  notificationData.event = notification.event.id;

  const subscriptions = await SeqModels.Subscription.findAll({
    where: {
      modes: {
        [Op.contains]: [notification.mode],
      },
      status: 'active',
    },
  });

  const sendNotification = async (subscription) => {
    const data = {
      model: 'Subscription',
      target: subscription.id,
      action: 'notify',
    };

    const same = await SeqModels.Record.count({
      where: {
        ...data,
        'data.id': notificationData.id,
      },
    });

    if (same > 0) {
      // Already notified.
      return;
    }

    const queue = [];

    const contactList = await SeqModels.Contact.find({
      where: {
        subscriptionId: subscription.id,
        status: 'active',
      },
      include: [{
        model: SeqModels.Auth,
        required: false,
      }],
    });

    for (const contact of contactList) {
      const inputs = { contact, subscription, template, notification };
      switch (contact.method) {
      case 'email':
        queue.push(notifyByEmail(inputs));
        break;
      case 'emailDailyReport':
        queue.push(notifyByEmailDailyReport(inputs));
        break;
      case 'twitter':
        queue.push(notifyByTwitter(inputs));
        break;
      case 'twitterAt':
        queue.push(notifyByTwitterAt(inputs));
        break;
      case 'weibo':
        queue.push(notifyByWeibo(inputs));
        break;
      case 'weiboAt':
        queue.push(notifyByWeiboAt(inputs));
        break;
      }
    }
    await Promise.all(queue);
  };

  const promises = subscriptions.map(s => sendNotification(s));
  await Promise.all(promises);
}

module.exports = notify;

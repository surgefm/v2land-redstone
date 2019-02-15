/**
 * 发出推送
 */
const SeqModels = require('../seqModels');
const { Op } = require('sequelize');
const notifyByEmail = require('./notifyByEmail');
const notifyByEmailDailyReport = require('./notifyByEmailDailyReport');
const notifyByTwitter = require('./notifyByTwitter');
const notifyByTwitterAt = require('./notifyByTwitterAt');
const notifyByWeibo = require('./notifyByWeibo');
const notifyByWeiboAt = require('./notifyByWeiboAt');
const notifyByMobileAppNotification = require('./notifyByMobileAppNotification');

async function notify(notification) {
  const eventId = notification.eventId;
  const event = notification.event || await SeqModels.Event.findById(eventId);
  const mode = ModeService[notification.mode];
  let news;
  let stack;
  if (mode.needNews) {
    news = SeqModels.News.findOne({
      where: {
        eventId: notification.eventId,
        status: 'admitted',
      },
      order: [['time', 'DESC']],
    });
    if (!news) return;
  }

  if (mode.needStack) {
    stack = SeqModels.Stack.findOne({
      where: {
        eventId: notification.eventId,
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
  notificationData.eventId = event.id;

  const subscriptions = await SeqModels.Subscription.findAll({
    where: {
      mode: notification.mode,
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

    const contactList = await SeqModels.Contact.findAll({
      where: {
        subscriptionId: subscription.id,
        status: 'active',
      },
      include: [{
        model: SeqModels.Auth,
        as: 'auth',
        required: false,
      }],
    });

    for (const contact of contactList) {
      contact.auth = (contact.auth || [])[0];
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
      case 'mobileAppNotification':
        queue.push(notifyByMobileAppNotification(inputs));
        break;
      }
    }
    await Promise.all(queue);
  };

  const promises = subscriptions.map(s => sendNotification(s));
  await Promise.all(promises);

  const nextTime = await mode.notified({
    notification,
    event,
    news: news, // news and stack may be undefined in some cases.
    stack: stack,
  });

  await notification.update({ time: nextTime });
}

module.exports = notify;

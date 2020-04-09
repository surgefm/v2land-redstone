/**
 * 发出推送
 */
import {
  Event, Notification, News, Stack, Subscription,
  Record, Contact, Auth, EventStackNews,
} from '@Models';
import { ModeService } from '@Services';
import { Op } from 'sequelize';
import notifyByEmail from './notifyByEmail';
import notifyByEmailDailyReport from './notifyByEmailDailyReport';
import notifyByTwitter from './notifyByTwitter';
import notifyByTwitterAt from './notifyByTwitterAt';
import notifyByWeibo from './notifyByWeibo';
import notifyByWeiboAt from './notifyByWeiboAt';
import notifyByMobileAppNotification from './notifyByMobileAppNotification';
import pino from 'pino';
const logger = pino();

async function notify(notification: Notification) {
  const eventId = notification.eventId;
  const event = notification.event || await Event.findByPk(eventId);
  const mode = ModeService.getMode(notification.mode);
  let news: News & { EventStackNews: EventStackNews };
  let stack;
  if (mode.needNews) {
    const newsList = await event.$get('news', {
      where: {
        eventId: notification.eventId,
        status: 'admitted',
      },
      order: [['time', 'DESC']],
    });
    if (newsList.length === 0) return;
    news = newsList[0];
  }

  if (mode.needStack) {
    stack = await Stack.findOne({
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

  const notificationData: any = notification.get({ plain: true });
  notificationData.eventId = event.id;

  const subscriptions = await Subscription.findAll({
    where: {
      mode: notification.mode,
      eventId: notification.eventId,
      status: 'active',
    },
  });

  const sendNotification = async (subscription: Subscription) => {
    const data = {
      model: 'Subscription',
      target: subscription.id,
      action: 'notify',
    };

    const same = await Record.count({
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

    const contactList = await Contact.findAll({
      where: {
        subscriptionId: subscription.id,
        status: 'active',
      },
      include: [{
        model: Auth,
        as: 'auth',
        required: false,
      }],
    });

    for (const contact of contactList) {
      if (!contact.auth && ['twitter', 'weibo', 'telegram'].includes(contact.type)) {
        contact.auth = await Auth.findOne({
          where: {
            site: contact.type,
            profileId: contact.profileId,
          },
          order: [['updatedAt', 'DESC']],
        });
      }
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
  try {
    await Promise.all(promises);
  } catch (err) {
    logger.error(err);
  }

  const nextTime = await mode.notified({
    notification,
    event,
    news: news, // news and stack may be undefined in some cases.
    stack: stack,
  });

  await Notification.update({
    status: 'complete',
  }, {
    where: { id: notification.id },
  });

  if (!['new', 'EveryNewStack'].includes(notification.mode)) {
    await Notification.create({
      eventId: notification.eventId,
      mode: notification.mode,
      time: nextTime,
      status: 'pending',
    });
  }
}

export default notify;

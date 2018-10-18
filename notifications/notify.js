/**
 * 发出推送
 */
const SeqModels = require('../seqModels');

async function notify(notification) {
  const { event } = notification;
  const mode = ModeService[notification.mode];
  const { news, stack } = notification.content;
  if ((mode.needNews && !news) || (mode.needStack && !stack)) {
    return SeqModels.Notification.upsert({ status: 'invalid' }, {
      where: { id: notification.id },
    });
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

    if (subscription.isInstant) {
      switch (subscription.method) {
      case 'email':
        await notifyByEmail(subscription, template);
        break;
      case 'twitter':
        await notifyByTwitter(subscription, template);
        break;
      case 'twitterAt':
        await notifyByTwitterAt(subscription, template);
        break;
      case 'weibo':
        await notifyByWeibo(subscription, template);
        break;
      case 'weiboAt':
        await notifyByWeiboAt(subscription, template);
        break;
      }
    }

    await sequelize.transaction(async transaction => {
      if (subscription.isDailyReport) {
        await SeqModels.Notification.addReport({
          time: notificationData.time,
          client: subscription.client,
          status: 'pending',
        }, { transaction });
      }

      await RecordService.create({
        model: 'Subscription',
        action: 'notify',
        target: subscription.id,
        data: notificationData,
        transaction,
      });
    });
  };

  const promises = subscriptions.map(s => sendNotification(s));
  await Promise.all(promises);
}

module.exports = notify;

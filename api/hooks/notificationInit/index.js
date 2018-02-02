module.exports = function PgPoolInit(sails) {
  const Model = sails.models;
  const checkInterval = 1000;

  return {

    initialize: function(cb) {
      if (sails.config.globals.notification) {
        setTimeout(check, checkInterval);
      }

      cb();
    },

  };

  /**
   * 检查有没有需要发出的推送
   * @constructor
   */
  async function check() {
    let notification = await Model.notification.findOne({
      order: 'time asc',
      where: { status: 'active' },
    })
      .populate('event')
      .populate('subscriptions', {
        where: { status: 'active' },
      });

    if (notification && !notification.event.name) {
      notification.status = 'inactive';
      await notification.save();
      notification = null;
    }

    if (notification && (notification.time - Date.now() < 0)) {
      await notify(notification);
      return check();
    }

    setTimeout(check, checkInterval);
  }

  /**
   * 发出推送
   * @constructor
   */
  async function notify(notification) {
    const { event, subscriptions } = notification;
    const mode = ModeService[notification.mode];
    const news = await Model.news.findOne({
      where: {
        status: 'admitted',
        event: event.id,
      },
      order: 'time desc',
    });

    if (!news && mode.needNews) {
      notification.status = 'inactive';
      return notification.save();
    }

    const template = await mode.getTemplate(notification, event, news);
    const promises = [];
    for (const subscription of subscriptions) {
      promises.push(new Promise(async (resolve, reject) => {
        if (['twitter', 'twitterAt'].includes(subscription.method)) {
          const auth = await Model.auth.findOne({
            site: 'twitter',
            owner: subscription.subscriber,
          });
          if (!auth) {
            subscription.status = 'inactive';
            await subscription.save();
            return reject(new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`));
          }

          let message = template.message;
          message += template.url + ' #浪潮';
          if (subscription.method === 'twitterAt') {
            message = '@' + subscription.contact.address + ' ' + message;
          }
          /** 这边写得是一团浆糊 */
          await TwitterService.tweet(auth, message);
          return resolve();
        } else if (['weibo', 'weiboAt'].includes(subscription.method)) {
          const auth = await Model.auth.findOne({
            site: 'weibo',
            owner: subscription.subscriber,
          });
          if (!auth) {
            subscription.status = 'inactive';
            await subscription.save();
            return reject(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
          }
          /** Do something */
          return resolve();
        } else if (subscription.method === 'email') {
          await EmailService.notify(template, subscription);
          return resolve();
        }
      }));
    }

    await Promise.all(promises);
  }

};

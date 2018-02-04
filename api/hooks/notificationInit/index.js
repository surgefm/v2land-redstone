module.exports = function PgPoolInit(sails) {
  let Model;
  const checkInterval = 1000;
  return {

    initialize: function(cb) {
      sails.on('hook:orm:loaded', () => {
        if (sails.config.globals.notification) {
          Model = sails.models;
          setTimeout(check, checkInterval);
        }

        cb();
      });
    },

  };

  /**
   * 检查有没有需要发出的推送
   */
  async function check() {
    try {
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
    } catch (err) {
      sails.log.error(err);
    }

    setTimeout(check, checkInterval);
  }

  /**
   * 发出推送
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
      const notify = async () => {
        const data = {
          model: 'Subscription',
          target: subscription.id,
          action: 'notify',
          data: { ...notification },
        };

        const same = await SQLService.find({
          model: 'record',
          where: data,
        });

        if (same.length > 0) {
          // Already notified.
          return;
        }

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
            await notifyByWeiboAt(subscription.template);
            break;
        }
        await SQLService.create({
          model: 'record',
          action: 'notify',
          data,
        });
        return;
      };

      promises.push(notify());
    }

    return Promise.all(promises);
  }

  /**
   * 发送邮件推送
   */
  async function notifyByEmail(subscription, template) {
    return EmailService.notify(subscription, template);
  }

  /**
   * 使用用户的绑定 Twitter 账号发布推文
   */
  async function notifyByTwitter(subscription, template) {
    const auth = await Model.auth.findOne({
      site: 'twitter',
      owner: subscription.subscriber,
    });
    if (!auth) {
      subscription.status = 'failed';
      await subscription.save();
      throw new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`);
    }

    let message = template.message;
    message += template.url + ' #浪潮';
    return TwitterService.tweet(auth, message);
  }

  /**
   * 使用浪潮的绑定账号发布推文并 @ 用户
   */
  async function notifyByTwitterAt(subscription, template) {
    if (!sails.config.globals.officialAccount.twitter) {
      throw new Error('未配置官方 Twitter 账号');
    }

    let profileId = sails.config.globals.officialAccount.twitter;
    profileId = typeof(profileId) === 'object'
      ? profileId[Math.floor(Math.random() * profileId.length)]
      : profileId;

    const auth = await Model.auth.findOne({
      site: 'twitter',
      profileId,
    });

    if (!auth) {
      subscription.status = 'failed';
      await subscription.save();
      throw new Error(`未找到浪潮 Twitter ${profileId} 的绑定`);
    }

    let message = '@' + subscription.contact.address + ' ';
    message += template.message + ' ' + template.url + ' #浪潮';
    return TwitterService.tweet(auth, message);
  }

  /**
   * 使用用户的绑定新浪账号发布微博
   */
  async function notifyByWeibo(subscription, template) {
    const auth = await Model.auth.findOne({
      site: 'weibo',
      owner: subscription.subscriber,
    });
    if (!auth) {
      subscription.status = 'failed';
      await subscription.save();
      throw new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`);
    }

    const message = template.message + ' ' + template.url;
    return WeiboService.post(auth, message);
  }

  /**
   * 使用浪潮的绑定账号发布微博并 @ 用户
   */
  async function notifyByWeiboAt(subscription, template) {
    if (!sails.config.globals.officialAccount.weibo) {
      throw new Error('未配置官方微博账号');
    }

    let profileId = sails.config.globals.officialAccount.weibo;
    profileId = typeof (profileId) === 'object'
      ? profileId[Math.floor(Math.random() * profileId.length)]
      : profileId;

    const auth = await Model.auth.findOne({
      site: 'weibo',
      profileId,
    });

    if (!auth) {
      subscription.status = 'failed';
      await subscription.save();
      throw new Error(`未找到浪潮微博 ${profileId} 的绑定`);
    }

    let message = '@' + subscription.contact.address + ' ';
    message += template.message;
    message += ' ' + Math.floor(Math.random() * 10000000) + ' ';
    message += template.url;

    return WeiboService.post(auth, message);
  }
};

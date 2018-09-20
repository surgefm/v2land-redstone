const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const SeqModels = require('../../../seqModels');

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
      const notification = await SeqModels.Notification.findOne({
        order: sequelize.literal('time DESC'),
        where: { status: 'pending' },
        include: [SeqModels.Event],
      });

      if (!notification) {
        setTimeout(check, checkInterval);
      } else if (!notification.event || !notification.event.name) {
        await notification.upsert({ status: 'inactive' });
        setTimeout(check, checkInterval);
      } else if (notification.time - Date.now() < 0) {
        await notify(notification);
        check();
      } else {
        setTimeout(check, checkInterval);
      }
    } catch (err) {
      sails.log.error(err);
      setTimeout(check, checkInterval);
    }
  }

  /**
   * 发出推送
   */
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

    const notify = async (subscription) => {
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

    const promises = subscriptions.map(s => notify(s));
    await Promise.all(promises);
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
      profileId: { '>=': 1 },
      owner: subscription.subscriber,
    });
    if (!auth) {
      subscription.status = 'failed';
      await subscription.save();
      return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的 Twitter 绑定`));
    }

    let message = template.message.length > 100
      ? (template.message.slice(0, 100) + '... ')
      : (template.message + ' ');
    message += template.url + ' #浪潮';
    return TwitterService.tweet(auth, message);
  }

  /**
   * 使用浪潮的绑定账号发布推文并 @ 用户
   */
  async function notifyByTwitterAt(subscription, template) {
    if (!sails.config.globals.officialAccount.twitter) {
      return sails.log.error(new Error('未配置官方 Twitter 账号'));
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
      return sails.log.error(new Error(`未找到浪潮 Twitter ${profileId} 的绑定`));
    }

    if (!subscription.contact.twitter) return disableSubscription(subscription);
    const client = await Model.auth.findOne({ id: subscription.contact.twitter });
    if (!client) return disableSubscription(subscription);

    let message = '@' + client.profile.screen_name + ' ';
    message += (template.message.length > 100
      ? (template.message.slice(0, 100) + '... ')
      : (template.message + ' '))
      + template.url + ' #浪潮';
    return TwitterService.tweet(auth, message);
  }

  /**
   * 使用用户的绑定新浪账号发布微博
   */
  async function notifyByWeibo(subscription, template) {
    const auth = await Model.auth.findOne({
      site: 'weibo',
      profileId: { '>=': 1 },
      owner: subscription.subscriber,
    });
    if (!auth) {
      await disableSubscription(subscription);
      return sails.log.error(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
    }

    const message = (template.message.length > 100
      ? (template.message.slice(0, 100) + '...')
      : (template))
      + ' ' + template.url;
    return WeiboService.post(auth, message);
  }

  /**
   * 使用浪潮的绑定账号发布微博并 @ 用户
   */
  async function notifyByWeiboAt(subscription, template) {
    if (!sails.config.globals.officialAccount.weibo) {
      return sails.log.error(new Error('未配置官方微博账号'));
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
      return sails.log.error(new Error(`未找到浪潮微博 ${profileId} 的绑定`));
    }

    if (!subscription.contact.weibo) return disableSubscription(subscription);
    const client = await Model.auth.findOne({ id: subscription.contact.weibo });
    if (!client) return disableSubscription(subscription);

    let message = '@' + client.profile.screen_name + ' ';
    message += template.message.length > 100
      ? (template.message.slice(0, 100) + '...')
      : (template);
    message += ' ' + Math.floor(Math.random() * 10000000) + ' ';
    message += template.url;

    return WeiboService.post(auth, message);
  }
};

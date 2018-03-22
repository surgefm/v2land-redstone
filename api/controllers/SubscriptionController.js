/**
 * SubscriptionController
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  unsubscribe: async (req, res) => {
    if (!(req.query && req.query.id && req.query.unsubscribeId)) {
      return res.status(400).json({
        message: '缺少 id 或 unsubscribeId 参数',
      });
    }

    const subscription = await Subscription.findOne(req.query);
    if (!subscription) {
      return res.status(404).json({
        message: '未找到该关注',
      });
    }

    await SQLService.update({
      model: 'subscription',
      action: 'cancelSubscription',
      where: { id: subscription.id },
      client: req.session.clientId,
      data: { status: 'unsubscribed' },
    });

    const otherSubscriptions = await Subscription.find({
      subscriber: subscription.subscriber,
      event: subscription.event,
      id: { '!': subscription.id },
    });

    if (otherSubscriptions.length > 0) {
      res.status(201).json({
        name: 'More subscriptions to the same event',
        message: '成功取消关注。你对该事件还有其他关注，是否一并取消？',
        subscriptionList: otherSubscriptions,
      });
    } else {
      res.status(201).json({
        name: 'Unsubscribe successfully',
        message: '成功取消关注。',
      });
    }
  },

  subscribe: async (req, res) => {
    if (!(req.body && req.body.mode && req.body.contact)) {
      return res.status(400).json({
        message: '缺少参数 mode 或 contact',
      });
    }

    const { mode, contact } = req.body;

    if (!ModeService[mode]) {
      return res.status(404).json({
        name: 'Subscribing mode not found.',
        message: '未找到该关注模式',
      });
    }

    const eventName = req.param('eventName');
    const event = await Event.findOne({
      or: [
        { id: parseInt(eventName) > -1 ? parseInt(eventName) : -1 },
        { name: eventName },
      ],
    });

    if (!event) {
      return res.status(404).json({
        name: 'Event not found.',
        message: '未找到该事件',
      });
    }

    if (event.status !== 'admitted') {
      return res.status(406).json({
        message: '该事件并不处于开放状态',
      });
    }

    const time = await NotificationService.getNextTime(mode, event);
    const notification = await Notification.findOrCreate({
      mode,
      time,
      event: event.id,
    });

    const subscriptions = await SQLService.find({
      model: 'subscription',
      where: {
        subscriber: req.session.clientId,
        notification: notification.id,
        mode,
        contact,
        method: contact.method,
        status: 'active',
      },
    });

    if (subscriptions[0]) {
      return res.status(200).json({
        message: '已有相同关注',
        subscription: subscriptions[0],
      });
    }

    let subscription = subscriptions[0];

    if (contact.method === 'email' && !contact.email) {
      return res.status(400).json({
        message: '请提供推送邮箱',
      });
    } else if (['twitter', 'twitterAt'].includes(contact.method)) {
      const auth = await Auth.findOne({
        site: 'twitter',
        id: contact.twitter,
        owner: req.session.clientId,
      });

      if (!auth) {
        return res.status(406).json({
          message: '您尚未绑定 Twitter，无法采用该推送方式',
        });
      }
    } else if (['weibo', 'weiboAt'].includes(contact.method)) {
      const auth = await Auth.findOne({
        site: 'weibo',
        id: contact.weibo,
        owner: req.session.clientId,
      });

      if (!auth) {
        return res.status(406).json({
          message: '您尚未绑定微博，无法采用该推送方式',
        });
      }
    } else if (!['twitter', 'twitterAt', 'weibo', 'weiboAt', 'email'].includes(contact.method)) {
      return res.status(400).json({
        message: '不支持的推送方式',
      });
    }

    try {
      const unsubscribeId = SubscriptionService.generateUnsubscribeId();
      subscription = {
        subscriber: req.session.clientId,
        notification: notification.id,
        event: event.id,
        mode,
        contact,
        method: contact.method,
        status: 'active',
        unsubscribeId,
      };

      subscription = await SQLService.create({
        model: 'subscription',
        action: 'createSubscription',
        client: req.session.clientId,
        data: subscription,
      });

      res.status(201).json({
        message: '关注成功',
        subscription,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

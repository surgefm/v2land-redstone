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

    subscription.status = 'unsubscribed';
    await subscription.save();

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

    await Record.create({
      model: 'Subscription',
      operation: 'update',
      action: 'cancelSubscription',
      target: subscription.id,
      data: subscription,
      client: req.session.clientId,
    });
  },

  subscribe: async (req, res) => {
    if (!(req.body && req.body.mode &&
      req.body.contact && req.body.method)) {
      return res.status(400).json({
        message: '缺少参数 mode、contact 或 method',
      });
    }

    const { mode, contact, method } = req.body;

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

    let subscription = await Subscription.findOne({
      subscriber: req.session.clientId,
      notification: notification.id,
      mode,
      contact,
      method,
    });

    if (subscription) {
      return res.status(200).json({
        message: '已有相同关注',
        subscription,
      });
    }

    if (['twitter', 'twitterAt'].includes(method)) {
      const auth = await Auth.findOne({
        site: 'twitter',
        profileId: contact,
        owner: req.session.clientId,
      });

      if (!auth) {
        return res.status(406).json({
          message: '您尚未绑定 Twitter，无法采用该推送方式',
        });
      }
    } else if (['weibo', 'weiboAt'].includes(method)) {
      const auth = await Auth.findOne({
        site: 'weibo',
        id: contact,
        owner: req.session.clientId,
      });

      if (!auth) {
        return res.status(406).json({
          message: '您尚未绑定微博，无法采用该推送方式',
        });
      }
    }

    try {
      const unsubscribeId = Math.floor(Math.random() * 100000000) + Date.now();
      subscription = await Subscription.create({
        subscriber: req.session.clientId,
        notification: notification.id,
        event: event.id,
        mode,
        contact,
        method,
        unsubscribeId,
      });

      res.status(201).json({
        message: '关注成功',
        subscription,
      });
    } catch (err) {
      return res.serverError(err);
    }

    await Record.create({
      model: 'Subscription',
      target: subscription.id,
      client: req.session.clientId,
      data: subscription,
      operation: 'create',
      action: 'createSubscription',
    });
  },

};

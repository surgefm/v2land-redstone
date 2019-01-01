/**
 * SubscriptionController
 *
 * @description :: Server-side logic for managing subscriptions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SeqModels = require('../../seqModels');
const { Op } = require('sequelize');
const _ = require('lodash');

module.exports = {

  unsubscribe: async (req, res) => {
    if (!(req.query && req.query.id && req.query.unsubscribeId)) {
      return res.status(400).json({
        message: '缺少 id 或 unsubscribeId 参数',
      });
    }

    const subscription = await SeqModels.Subscription.findOne({
      where: req.query,
    });

    if (!subscription) {
      return res.status(404).json({
        message: '未找到该关注',
      });
    }

    let methods;

    await sequelize.transaction(async transaction => {
      if (req.query.method) {
        methods = _.without(subscription.methods, req.query.method);
        await subscription.update({ methods }, { transaction });
      } else {
        await subscription.update({ status: 'unsubscribed' }, { transaction });
      }

      await RecordService.update({
        model: 'Subscription',
        action: 'cancelSubscription',
        owner: req.session.clientId,
        data: req.query.method ? methods : { status: 'unsubscribed' },
        before: subscription,
      }, { transaction });
    });

    const otherSubscriptions = await SeqModels.Subscription.findAll({
      where: {
        subscriber: subscription.subscriber,
        eventId: subscription.eventId,
        id: { [Op.ne]: subscription.id },
      },
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
    let client;
    if (req.session.clientId) {
      client = await SeqModels.Client.findOne({
        where: { id: req.session.clientId },
        include: [{
          model: SeqModels.Auth,
          required: false,
          as: 'auths',
        }],
      });
    }

    if (!ModeService[mode]) {
      return res.status(404).json({
        name: 'Subscribing mode not found',
        message: '未找到该关注模式',
      });
    }

    if (!['twitter', 'twitterAt', 'weibo', 'weiboAt', 'email', 'emailDailyReport'].includes(contact.method)) {
      return res.status(400).json({
        name: 'Notification method not supported',
        message: '不支持的推送方式',
      });
    }

    let auth;
    if (ContactService.getTypeFromMethod(contact.method) !== 'email') {
      for (const item of client.auths) {
        if (item.id === contact.authId &&
          item.site === ContactService.getTypeFromMethod(contact.method)) {
          auth = item;
          break;
        }
      }
      if (typeof auth === 'undefined') {
        return res.status(400).json({
          name: 'Corresponding third-party contact not found',
          message: '未找到您在相关网络服务上的绑定。请于绑定后进行',
        });
      }
    } else {
      auth = { profileId: contact.profileId || client.email };
    }

    const eventName = req.param('eventName');
    const event = await EventService.findEvent(eventName, { eventOnly: true });

    if (!event) {
      return res.status(404).json({
        name: 'Event not found',
        message: '未找到该事件',
      });
    }

    if (event.status !== 'admitted') {
      return res.status(406).json({
        message: '该事件并不处于开放状态，无法进行关注',
      });
    }

    let subscription = await SeqModels.Subscription.findOne({
      where: {
        subscriber: req.session.clientId,
        eventId: event.id,
        mode,
        status: 'active',
      },
    });

    if (subscription) {
      const oldContact = await SeqModels.Contact.findOne({
        where: {
          owner: req.session.clientId,
          method: contact.method,
          profileId: auth.profileId,
          subscriptionId: subscription.id,
        },
      });

      if (oldContact) {
        return res.status(200).json({
          message: '已有相同关注',
          subscription,
        });
      }
    }

    try {
      const beforeData = subscription
        ? subscription.get({ plain: true })
        : {};
      await sequelize.transaction(async transaction => {
        const action = subscription ? 'addModeToSubscription' : 'createSubscription';
        if (!subscription) {
          const notificationInDb = await SeqModels.Notification.findOne({
            where: {
              eventId: event.id,
              mode,
            },
            transaction,
          });

          if (!notificationInDb) {
            const time = await NotificationService.getNextTime(mode, event);
            await SeqModels.Notification.create({
              eventId: event.id,
              mode,
              time,
              status: 'pending',
            }, { transaction });
          }

          const unsubscribeId = SubscriptionService.generateUnsubscribeId();
          subscription = {
            subscriber: req.session.clientId,
            eventId: event.id,
            mode,
            methods: [contact.method],
            status: 'active',
            unsubscribeId,
          };

          subscription = await SeqModels.Subscription.create(
            subscription,
            { transaction },
          );
        }

        await SeqModels.Contact.create({
          subscriptionId: subscription.id,
          method: contact.method,
          profileId: auth.profileId,
          authId: auth.id,
          owner: req.session.clientId,
          type: ContactService.getTypeFromMethod(contact.method),
        }, { transaction });

        await RecordService.create({
          model: 'Subscription',
          action,
          owner: req.session.clientId,
          data: subscription,
          before: beforeData,
        }, { transaction });

        return res.status(201).json({
          message: '关注成功',
          subscription,
        });
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

};

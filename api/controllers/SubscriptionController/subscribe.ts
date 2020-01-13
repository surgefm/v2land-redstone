import { RedstoneRequest, RedstoneResponse, sequelize } from '@Types';
import { Client, Auth, Subscription, Notification, Contact } from '@Models';
import {
  ModeService, ContactService, EventService,
  NotificationService, SubscriptionService, RecordService,
} from '@Services';

async function subscribe (req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.body && req.body.mode && req.body.contact)) {
    return res.status(400).json({
      message: '缺少参数 mode 或 contact',
    });
  }

  const { mode, contact } = req.body;
  let client;
  if (req.session.clientId) {
    client = await Client.findOne({
      where: { id: req.session.clientId },
      include: [{
        model: Auth,
        required: false,
        as: 'auths',
      }],
    });
  }

  if (!ModeService.getMode(mode)) {
    return res.status(404).json({
      name: 'Subscribing mode not found',
      message: '未找到该关注模式',
    });
  }

  if (!['twitter', 'twitterAt', 'weibo', 'weiboAt', 'email', 'emailDailyReport', 'mobileAppNotification'].includes(contact.method)) {
    return res.status(400).json({
      name: 'Notification method not supported',
      message: '不支持的推送方式',
    });
  }

  let auth: Auth | { profileId: string, id?: number };
  const type = ContactService.getTypeFromMethod(contact.method);
  if (!['email', 'mobileApp'].includes(type)) {
    for (const item of client.auths) {
      if (item.id === contact[type] && item.site === type) {
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

  let subscription = await Subscription.findOne({
    where: {
      subscriber: req.session.clientId,
      eventId: event.id,
      mode,
      status: 'active',
    },
  });

  if (subscription) {
    const oldContact = await Contact.findOne({
      where: {
        owner: req.session.clientId,
        method: contact.method,
        profileId: auth.profileId,
        subscriptionId: subscription.id,
        status: 'active',
      },
    });

    if (oldContact) {
      return res.status(200).json({
        message: '已有相同关注',
        subscription,
      });
    }
  }

  const beforeData = subscription
    ? subscription.get({ plain: true })
    : {};
  await sequelize.transaction(async transaction => {
    const action = subscription ? 'addContactToSubscription' : 'createSubscription';
    if (!subscription) {
      const notificationInDb = ['new', 'EveryNewStack'].includes(mode)
        ? true
        : await Notification.findOne({
          where: {
            eventId: event.id,
            mode,
          },
          transaction,
        });

      if (!notificationInDb) {
        const time = await NotificationService.getNextTime(mode, event);
        await Notification.create({
          eventId: event.id,
          mode,
          time,
          status: 'pending',
        }, { transaction });
      }

      const unsubscribeId = SubscriptionService.generateUnsubscribeId();

      subscription = await Subscription.create(
        {
          subscriber: req.session.clientId,
          eventId: event.id,
          mode,
          status: 'active',
          unsubscribeId,
        },
        { transaction },
      );
    }

    await Contact.create({
      subscriptionId: subscription.id,
      method: contact.method,
      profileId: auth.profileId,
      authId: auth.id,
      owner: req.session.clientId,
      type: ContactService.getTypeFromMethod(contact.method),
      unsubscribeId: SubscriptionService.generateUnsubscribeId(),
    }, { transaction });

    await RecordService.create({
      model: 'Subscription',
      action,
      owner: req.session.clientId,
      data: subscription,
      target: subscription.id,
      before: beforeData,
    }, { transaction });

    subscription = await Subscription.findOne({
      where: { id: subscription.id },
      include: [{
        model: Contact,
        required: false,
        where: { status: 'active' },
      }],
      transaction,
    });

    return res.status(201).json({
      message: '关注成功',
      subscription,
    });
  });
}

export default subscribe;

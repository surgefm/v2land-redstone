const SeqModels = require('../../../seqModels');
const { Op } = require('sequelize');
const _ = require('lodash');

async function unsubscribe (req, res) {
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
}

module.exports = unsubscribe;

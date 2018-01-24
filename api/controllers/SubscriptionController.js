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

    let subscription = await Subscription.findOne(req.query);
    if (!subscription) {
      return res.status(404).json({
        message: '未找到该关注',
      });
    }

    subscription.status = 'unsubscribed';
    await subscription.save();

    let otherSubscriptions = await Subscription.find({
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

};

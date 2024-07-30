import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, RedisService } from '@Services';
import { webpush } from '@Services/NotificationService';

async function notifySubscriber(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name);
  const eventId = await EventService.getEventId(name);

  const subscriptions = await RedisService.hgetall(RedisService.getSubscriptionCacheKey(eventId));
  // eslint-disable-next-line guard-for-in
  await Promise.all(Object.keys(subscriptions).map(async (key) => {
    const subscription = JSON.parse(key);

    return webpush.sendNotification(subscription, JSON.stringify({
      eventId,
      title: event.name,
      message: (req.body || {}).message || '社区编辑给你发来了一条通知',
    }));
  }));

  return res.status(200).json({
    message: '通知成功',
  });
}

export default notifySubscriber;

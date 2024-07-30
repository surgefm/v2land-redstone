import { RedstoneRequest, RedstoneResponse } from '@Types';
import {
  RedisService, EventService,
} from '@Services';
import { webpush } from '@Services/NotificationService';

async function pwaSubscribe(req: RedstoneRequest, res: RedstoneResponse) {
  if (!(req.body && req.body.subscriptionJSON)) {
    return res.status(400).json({
      message: '缺少参数 subscriptionJSON',
    });
  }

  const { subscriptionJSON } = req.body;

  const eventName = req.params.eventName;
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

  try {
    const subscription = JSON.parse(subscriptionJSON);
    await webpush.sendNotification(subscription, JSON.stringify({
      message: '关注成功',
      purpose: 'new registration',
    }));
  } catch (err) {
    return res.status(401).json({
      message: '关注失败',
    });
  }

  await RedisService.hset(RedisService.getSubscriptionCacheKey(event.id), subscriptionJSON, 'updates');

  return res.status(201).json({
    message: '关注成功',
  });
}

export default pwaSubscribe;

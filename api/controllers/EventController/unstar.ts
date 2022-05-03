import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, StarService } from '@Services';

async function unstar(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  await StarService.unstar(eventId, req.session.clientId);

  return res.status(201).json({
    message: '成功取消收藏该时间线',
  });
}

export default unstar;

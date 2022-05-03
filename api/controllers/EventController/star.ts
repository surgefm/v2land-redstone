import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, StarService } from '@Services';

async function star(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const star = await StarService.star(eventId, req.session.clientId);

  if (star.isNewRecord) {
    return res.status(201).json({
      message: '成功收藏该时间线',
      star,
    });
  }

  return res.status(200).json({
    message: '你已收藏过该时间线',
    star,
  });
}

export default star;

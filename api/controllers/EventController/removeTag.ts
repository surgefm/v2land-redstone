import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function removeTag(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const eventTag = await EventService.removeTag(eventId, +req.params.tagId, req.session.clientId);
  if (!eventTag) {
    return res.status(200).json({
      message: '时间线并无该话题',
    });
  }

  return res.status(201).json({
    message: '成功将话题从时间线中移除。',
  });
}

export default removeTag;

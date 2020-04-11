import { Event } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function forkEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const eventId = await EventService.getEventId(req.params.eventName);
  if (!eventId) {
    return res.status(404).json({
      message: '未能找到该事件',
    });
  }

  const origEvent = await Event.findByPk(eventId);
  const event = await EventService.forkEvent(eventId, req.currentClient);
  return res.status(201).json({
    message: `成功复制「${origEvent.name}」`,
    event,
  });
}

export default forkEvent;

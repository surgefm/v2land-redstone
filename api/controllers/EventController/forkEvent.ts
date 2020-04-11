import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function forkEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const eventId = await EventService.getEventId(req.params.eventName);
  if (!eventId) {
    return res.status(404).json({
      message: '未能找到该事件',
    });
  }

  const event = await EventService.forkEvent(eventId, req.currentClient);
  if (event) {
    return res.status(201).json({
      message: `成功复刻「${event.name}」`,
      event,
    });
  } else {
    return res.status(200).json({
      message: '你的账户下已有同名事件',
    });
  }
}

export default forkEvent;

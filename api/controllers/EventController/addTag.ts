import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function addTag(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body.tag) {
    return res.status(400).json({
      message: '缺少参数：tag',
    });
  }

  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const eventTag = await EventService.addTag(eventId, req.body.tag, req.session.clientId);

  if (!eventTag) {
    return res.status(200).json({
      message: `事件已有该话题。`,
    });
  } else {
    return res.status(201).json({
      message: `成功将话题添加至时间线中。`,
    });
  }
}

export default addTag;

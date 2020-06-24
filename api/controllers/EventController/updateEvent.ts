import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function updateEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name);

  if (!req.body) {
    return res.status(400).json({
      message: '缺少参数',
    });
  }

  if (req.body.status && !req.currentClient.isEditor) {
    return res.status(403).json({
      message: '你没有修改事件状态的权限',
    });
  }

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const e = EventService.updateEvent(event, req.body, req.currentClient);

  if (e === null) {
    return res.status(200).json({
      message: '什么变化也没有发生',
      event,
    });
  }

  res.status(201).json({
    message: '修改成功',
    event: e,
  });
}

export default updateEvent;

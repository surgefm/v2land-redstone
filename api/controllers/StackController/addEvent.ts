import { RedstoneRequest, RedstoneResponse } from '@Types';
import { StackService } from '@Services';

async function addEvent(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body || !req.body.eventId) {
    return res.status(400).json({
      message: '缺少参数：eventId。',
    });
  }

  const id = +req.params.stackId;
  const stack = await StackService.addEvent(id, req.body.eventId, req.currentClient.id);

  if (!stack) {
    return res.status(200).json({
      message: '该时间线已在这个进展中',
    });
  }

  return res.status(201).json({
    message: '成功将时间线添加至进展中',
  });
}

export default addEvent;

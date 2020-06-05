import { RedstoneRequest, RedstoneResponse } from '@Types';
import { StackService } from '@Services';

async function removeEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const id = +req.params.stackId;
  const stack = await StackService.removeEvent(id, req.currentClient.id);

  if (!stack) {
    return res.status(200).json({
      message: '该进展下没有时间线',
    });
  }

  return res.status(201).json({
    message: '成功将时间线从该进展中移除',
  });
}

export default removeEvent;

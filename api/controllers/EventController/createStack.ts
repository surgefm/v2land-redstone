import { RedstoneRequest, RedstoneResponse } from '@Types';
import { StackService, EventService } from '@Services';

async function createStack(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const data = req.body;

  const stack = await StackService.createStack(eventId, data, req.session.clientId);
  res.status(201).json({
    message: '提交成功，该进展在社区管理员审核通过后将很快开放',
    stack,
  });
}

export default createStack;

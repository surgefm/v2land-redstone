import { RedstoneRequest, RedstoneResponse } from '@Types';
import { StackService } from '@Services';

async function createStack (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const data = req.body;

  const stack = await StackService.createStack(name, data, req.session.clientId);
  res.status(201).json({
    message: '提交成功，该进展在社区管理员审核通过后将很快开放',
    stack,
  });
}

export default createStack;

import { RedstoneRequest, RedstoneResponse } from '@Types';
import { StackService, AccessControlService } from '@Services';

async function getStack(req: RedstoneRequest, res: RedstoneResponse) {
  const id = +req.params.stackId;
  const stack = await StackService.findStack(id);
  if (stack) {
    stack.contribution = await StackService.getContribution({ id }, true);
    if (stack.status !== 'admitted') {
      if (req.session.clientId) {
        if (await AccessControlService.isClientEditor(req.session.clientId)) {
          return res.status(200).json({ stack });
        }
      }
    } else {
      return res.status(200).json({ stack });
    }
  }

  res.status(404).json({
    message: '该进展不存在，或尚未通过审核',
  });
}

export default getStack;

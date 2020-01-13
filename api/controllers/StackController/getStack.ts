import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Client } from '@Models';
import { StackService } from '@Services';

async function getStack (req: RedstoneRequest, res: RedstoneResponse) {
  const id = req.param('stackId');
  const stack = await StackService.findStack(id);
  if (stack) {
    stack.contribution = await StackService.getContribution(id, true);
    if (stack.status !== 'admitted') {
      if (req.session.clientId) {
        const client = await Client.findOne({
          where: { id: req.session.clientId },
        });
        if (client && ['manager', 'admin'].includes(client.role)) {
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

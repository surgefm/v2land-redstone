import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService } from '@Services';
import { Stack } from '@Models';

const hasStackPermission = (action: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const stackId = +req.params.stackId;
  const stack = await Stack.findByPk(stackId);
  if (!stack) {
    return res.status(404).json({
      message: '未找到该进展',
    });
  }

  const resource = AccessControlService.getEventResourceId(stack.eventId);
  const haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, action);
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasStackPermission;

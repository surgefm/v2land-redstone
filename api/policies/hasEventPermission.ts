import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService, EventService } from '@Services';

const hasEventPermission = (action: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const resource = AccessControlService.getEventResourceId(eventId);
  const haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, action);
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasEventPermission;

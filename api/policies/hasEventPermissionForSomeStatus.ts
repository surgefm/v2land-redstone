import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService, EventService } from '@Services';
import _ from 'lodash';

const hasEventPermissionForSomeStatus = (errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name);
  const eventId = await EventService.getEventId(name);
  let haveAccess = false;
  if (_.isUndefined(event)) {
    return res.status(404).json({
      message: '用户请求的事件不存在',
    });
  }
  if (event.status === 'admitted') {
    haveAccess = true;
  } else if (event.status === 'hidden' || event.status === 'removed') {
    haveAccess = await AccessControlService.hasRole(req.session.clientId, AccessControlService.getEventViewRolePlain(eventId));
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, 'editors');
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, 'admins');
  } else if (event.status === 'rejected') {
    haveAccess = await AccessControlService.hasRole(req.session.clientId, AccessControlService.getEventOwnerRolePlain(eventId));
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, 'editors');
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, 'admins');
  }
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasEventPermissionForSomeStatus;

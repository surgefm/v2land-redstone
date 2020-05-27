import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService, EventService } from '@Services';
import _ from 'lodash';

const hasEventPermissionForSomeStatus = (errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const eventId = await EventService.getEventId(req.params);
  const event = await EventService.findEvent(eventId);
  let haveAccess = false;
  if (_.isUndefined(event)) {
    return res.status(404).json({
      message: '用户请求的事件不存在',
    });
  }
  if (event.status === 'admitted') {
    haveAccess = true;
  } else {
    if (typeof req.session === 'undefined') {
      return res.status(401).json({
        message: '请在登录后进行该操作',
      });
    }
    if (event.status === 'hidden' || event.status === 'removed') {
      haveAccess = await AccessControlService.hasRole(req.session.clientId, AccessControlService.getEventViewRolePlain(eventId));
    } else if (event.status === 'rejected') {
      haveAccess = await AccessControlService.hasRole(req.session.clientId, AccessControlService.getEventOwnerRolePlain(eventId));
    }
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, AccessControlService.roles.editors);
    haveAccess = haveAccess || await AccessControlService.hasRole(req.session.clientId, AccessControlService.roles.admins);
  }
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有查看事件的权限',
  });
};

export default hasEventPermissionForSomeStatus;

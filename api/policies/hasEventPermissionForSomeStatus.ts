import { RedstoneRequest, RedstoneResponse, NextFunction } from '@Types';
import { AccessControlService, EventService } from '@Services';
import _ from 'lodash';

const hasEventPermissionForSomeStatus = (action?: string, errorMessage?: string) => async (req: RedstoneRequest, res: RedstoneResponse, next: NextFunction) => {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name);
  const eventId = await EventService.getEventId(name);
  const resource = AccessControlService.getEventResourceId(eventId);
  let haveAccess = false;
  if (_.isUndefined(event)) {
    haveAccess = true;
  } else if (event.status === 'admitted') {
    haveAccess = true;
  } else if (event.status === 'hidden' || event.status === 'hidden') {
    haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, 'view') || await AccessControlService.hasRole(req.session.clientId, 'editors');
  } else if (event.status === 'rejected') {
    haveAccess = await AccessControlService.isAllowed(req.session.clientId, resource, 'owner') || await AccessControlService.hasRole(req.session.clientId, 'editors');
  }
  if (haveAccess) return next();

  return res.status(403).json({
    message: errorMessage || '用户没有该权限',
  });
};

export default hasEventPermissionForSomeStatus;

import { isAllowed, hasRole } from '@Services/AccessControlService/operations';
import { admins } from '../roles';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToViewEvent(clientId: number, eventId: number) {
  if (await hasRole(clientId, admins)) return true;
  return isAllowed(clientId, getEventResourceId(eventId), 'view');
}

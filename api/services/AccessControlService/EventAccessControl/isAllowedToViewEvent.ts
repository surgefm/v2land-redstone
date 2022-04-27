import { isAllowed, hasRole } from '@Services/AccessControlService/operations';
import { editors } from '../roles';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToViewEvent(clientId: number, eventId: number) {
  if (await hasRole(clientId, editors)) return true;
  return isAllowed(clientId, getEventResourceId(eventId), 'view');
}

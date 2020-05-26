import { hasRole } from '@Services/AccessControlService/operations';
import { getEventOwnerRolePlain } from './getEventRoles';
import isAllowedToManageEvent from './isAllowedToManageEvent';
import isAllowedToEditEvent from './isAllowedToEditEvent';
import isAllowedToViewEvent from './isAllowedToViewEvent';

export default async function getClientEventRole(clientId: number, eventId: number) {
  if (await hasRole(clientId, getEventOwnerRolePlain(eventId))) return 'owner';
  if (await isAllowedToManageEvent(clientId, eventId)) return 'manager';
  if (await isAllowedToEditEvent(clientId, eventId)) return 'editor';
  if (await isAllowedToViewEvent(clientId, eventId)) return 'viewer';
  return 'passerby';
}

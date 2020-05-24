import { hasRole } from '@Services/AccessControlService/operations';
import {
  getEventViewRolePlain,
  getEventEditRolePlain,
  getEventManageRolePlain,
  getEventOwnerRolePlain,
} from './getEventRoles';

export default async function getClientEventRole(clientId: number, eventId: number) {
  if (await hasRole(clientId, getEventOwnerRolePlain(eventId))) return 'owner';
  if (await hasRole(clientId, getEventManageRolePlain(eventId))) return 'manager';
  if (await hasRole(clientId, getEventEditRolePlain(eventId))) return 'editor';
  if (await hasRole(clientId, getEventViewRolePlain(eventId))) return 'viewer';
  return null;
}

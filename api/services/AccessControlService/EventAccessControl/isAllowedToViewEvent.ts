import { isAllowed } from '@Services/AccessControlService/operations';
import { isClientEditor } from '../RoleAccessControl';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToViewEvent(clientId: number, eventId: number) {
  if (await isClientEditor(clientId)) return true;
  return isAllowed(clientId, getEventResourceId(eventId), 'view');
}

import { isAllowed } from '@Services/AccessControlService/operations';
import { isClientEditor } from '@Services/AccessControlService/RoleAccessControl';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToEditEvent(clientId: number, eventId: number) {
  return await isAllowed(clientId, getEventResourceId(eventId), 'edit') ||
    await isClientEditor(clientId);
}

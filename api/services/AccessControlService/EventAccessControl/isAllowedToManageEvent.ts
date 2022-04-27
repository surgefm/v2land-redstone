import { isAllowed } from '@Services/AccessControlService/operations';
import { isClientManager } from '@Services/AccessControlService/RoleAccessControl';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToManageEvent(clientId: number, eventId: number) {
  return await isAllowed(clientId, getEventResourceId(eventId), 'addViewer') ||
    await isClientManager(clientId);
}

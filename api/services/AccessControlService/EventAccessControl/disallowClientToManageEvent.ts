import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getEventManageRolePlain } from './getEventRoles';

export default async function disallowClientToManageEvent(clientId: number, eventId: number) {
  return removeUserRoles(clientId, getEventManageRolePlain(eventId));
}

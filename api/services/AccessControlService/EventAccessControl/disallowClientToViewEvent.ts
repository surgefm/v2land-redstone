import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getEventViewRolePlain } from './getEventRoles';

export default async function disallowClientToViewEvent(clientId: number, eventId: number) {
  return removeUserRoles(clientId, getEventViewRolePlain(eventId));
}

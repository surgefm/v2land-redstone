import { removeUserRoles } from './operations';
import { getEventEditRolePlain } from './getEventRoles';

export default async function disallowClientToEditEvent(clientId: number, eventId: number) {
  return removeUserRoles(clientId, getEventEditRolePlain(eventId));
}

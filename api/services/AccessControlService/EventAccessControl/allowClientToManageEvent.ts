import { addUserRoles } from '../operations';
import { getEventManageRole } from './getEventRoles';

export default async function allowClientToManageEvent(clientId: number, eventId: number) {
  return addUserRoles(clientId, await getEventManageRole(eventId));
}

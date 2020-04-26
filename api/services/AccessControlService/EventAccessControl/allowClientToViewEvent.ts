import { addUserRoles } from '../operations';
import { getEventViewRole } from './getEventRoles';

export default async function allowClientToViewEvent(clientId: number, eventId: number) {
  return addUserRoles(clientId, await getEventViewRole(eventId));
}

import { addUserRoles } from '../operations';
import { getEventEditRole } from './getEventRoles';

export default async function allowClientToEditEvent(clientId: number, eventId: number) {
  return addUserRoles(clientId, await getEventEditRole(eventId));
}

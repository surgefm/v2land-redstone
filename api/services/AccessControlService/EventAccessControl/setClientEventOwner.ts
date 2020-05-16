import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventOwnerRole } from './getEventRoles';

export default async function setClientEventOwner(clientId: number, eventId: number) {
  return addUserRoles(clientId, await getEventOwnerRole(eventId));
}

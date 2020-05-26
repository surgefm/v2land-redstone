import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventOwnerRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToEditEvent from './disallowClientToEditEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function setClientEventOwner(clientId: number, eventId: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToEditEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  return addUserRoles(clientId, await getEventOwnerRole(eventId));
}

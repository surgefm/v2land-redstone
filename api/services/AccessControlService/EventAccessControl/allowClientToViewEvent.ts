import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventViewRole } from './getEventRoles';
import disallowClientToEditEvent from './disallowClientToEditEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function allowClientToViewEvent(clientId: number, eventId: number) {
  await disallowClientToEditEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  return addUserRoles(clientId, await getEventViewRole(eventId));
}

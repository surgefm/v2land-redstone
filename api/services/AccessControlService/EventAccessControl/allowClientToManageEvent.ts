import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventManageRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToEditEvent from './disallowClientToEditEvent';

export default async function allowClientToManageEvent(clientId: number, eventId: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToEditEvent(clientId, eventId);
  return addUserRoles(clientId, await getEventManageRole(eventId));
}

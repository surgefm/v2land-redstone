import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventEditRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function allowClientToEditEvent(clientId: number, eventId: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  return addUserRoles(clientId, await getEventEditRole(eventId));
}

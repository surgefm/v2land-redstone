import { isAllowed } from '@Services/AccessControlService/operations';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToEditEvent(clientId: number, eventId: number) {
  return isAllowed(clientId, getEventResourceId(eventId), 'edit');
}

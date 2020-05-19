import { isAllowed } from '@Services/AccessControlService/operations';
import { getEventResourceId } from './getEventRoles';

export default async function isAllowedToManageEvent(clientId: number, eventId: number) {
  return isAllowed(clientId, getEventResourceId(eventId), 'addViewer');
}

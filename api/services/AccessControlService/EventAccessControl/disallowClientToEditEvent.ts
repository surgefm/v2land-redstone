import * as RecordService from '@Services/RecordService';
import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getEventEditRolePlain } from './getEventRoles';

export default async function disallowClientToEditEvent(clientId: number, eventId: number, by?: number) {
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'disallowClientToEditEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return removeUserRoles(clientId, getEventEditRolePlain(eventId));
}

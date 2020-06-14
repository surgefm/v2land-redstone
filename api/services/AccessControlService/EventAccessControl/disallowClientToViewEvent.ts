import * as RecordService from '@Services/RecordService';
import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getEventViewRolePlain } from './getEventRoles';

export default async function disallowClientToViewEvent(clientId: number, eventId: number, by?: number) {
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'disallowClientToViewEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return removeUserRoles(clientId, getEventViewRolePlain(eventId));
}

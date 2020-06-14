import * as RecordService from '@Services/RecordService';
import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getEventManageRolePlain } from './getEventRoles';

export default async function disallowClientToManageEvent(clientId: number, eventId: number, by?: number) {
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'disallowClientToManageEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return removeUserRoles(clientId, getEventManageRolePlain(eventId));
}

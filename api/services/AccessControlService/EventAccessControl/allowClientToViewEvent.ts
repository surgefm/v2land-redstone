import * as RecordService from '@Services/RecordService';
import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventViewRole } from './getEventRoles';
import disallowClientToEditEvent from './disallowClientToEditEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function allowClientToViewEvent(clientId: number, eventId: number, by?: number) {
  await disallowClientToEditEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'allowClientToViewEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return addUserRoles(clientId, await getEventViewRole(eventId));
}

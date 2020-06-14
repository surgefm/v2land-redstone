import * as RecordService from '@Services/RecordService';
import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventManageRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToEditEvent from './disallowClientToEditEvent';

export default async function allowClientToManageEvent(clientId: number, eventId: number, by?: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToEditEvent(clientId, eventId);
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'allowClientToManageEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return addUserRoles(clientId, await getEventManageRole(eventId));
}

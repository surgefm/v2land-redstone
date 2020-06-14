import * as RecordService from '@Services/RecordService';
import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventEditRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function allowClientToEditEvent(clientId: number, eventId: number, by?: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'allowClientToEditEvent',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return addUserRoles(clientId, await getEventEditRole(eventId));
}

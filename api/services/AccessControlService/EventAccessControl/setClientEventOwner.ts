import { Event } from '@Models';
import * as RecordService from '@Services/RecordService';
import { addUserRoles } from '@Services/AccessControlService/operations';
import { getEventOwnerRole } from './getEventRoles';
import disallowClientToViewEvent from './disallowClientToViewEvent';
import disallowClientToEditEvent from './disallowClientToEditEvent';
import disallowClientToManageEvent from './disallowClientToManageEvent';

export default async function setClientEventOwner(clientId: number, eventId: number, by?: number) {
  await disallowClientToViewEvent(clientId, eventId);
  await disallowClientToEditEvent(clientId, eventId);
  await disallowClientToManageEvent(clientId, eventId);
  const event = await Event.findByPk(eventId);
  if (event) {
    event.ownerId = clientId;
    await event.save();
  }
  if (by) {
    await RecordService.create({
      model: 'Client',
      action: 'setClientEventOwner',
      target: clientId,
      subtarget: eventId,
      owner: by,
    });
  }
  return addUserRoles(clientId, await getEventOwnerRole(eventId));
}

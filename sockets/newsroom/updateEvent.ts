import { Socket } from 'socket.io';
import { EventObj } from '@Types';
import { Client } from '@Models';
import { EventService, AccessControlService } from '@Services';

import getRoomName from './getRoomName';

export default function updateEvent(socket: Socket) {
  socket.on('update event information', async (eventId: number, data: EventObj, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    const event = await EventService.findEvent(eventId, { eventOnly: true });
    if (!event) return cb('Event not found');

    try {
      const e = await EventService.updateEvent(event, data, await Client.findByPk(clientId));
      const { id, name, description, needContributor } = e;
      if (e !== null) {
        socket.to(getRoomName(eventId)).emit('update event information', { event: { id, name, description, needContributor } });
      }
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}

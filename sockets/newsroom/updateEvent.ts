import { Socket } from 'socket.io';
import { EventObj } from '@Types';
import { EventService } from '@Services';

import getRoomName from './getRoomName';

export default function updateEvent(socket: Socket) {
  socket.on('update event information', async (eventId: number, data: EventObj, cb: Function) => {
    const event = await EventService.findEvent(eventId, { eventOnly: true });
    if (!event) return cb('Event not found');

    // TODO: check user’s permission
    const e = await EventService.updateEvent(event, data, socket.handshake.session.currentClient);
    if (e !== null) {
      socket.to(getRoomName(eventId)).emit('update event information', e);
    }
  });
}

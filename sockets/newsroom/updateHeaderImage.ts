import { Socket } from 'socket.io';
import { EventService, AccessControlService } from '@Services';

import getRoomName from './getRoomName';

export default function updateHeaderImage(socket: Socket) {
  socket.on('update header image', async (eventId: number, data: { [index: string]: string}, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    try {
      const headerImage = await EventService.updateHeaderImage(eventId, data, clientId);
      socket.in(getRoomName(eventId)).emit('update header image', { eventId, headerImage });
      cb(null, { headerImage });
    } catch (err) {
      cb(err.message);
    }
  });
}

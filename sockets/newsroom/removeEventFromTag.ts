import { Socket } from 'socket.io';
import { EventService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function removeEventFromStack(socket: Socket) {
  socket.on('remove event from tag', async (eventId: number, tagId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    try {
      const eventTag = await EventService.removeTag(eventId, tagId, clientId);
      if (eventTag) {
        socket.in(getRoomName(eventId)).emit('remove event from tag', { eventId, tagId });
      }
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}

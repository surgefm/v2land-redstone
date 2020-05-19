import { Socket } from 'socket.io';
import { ResourceLockService, AccessControlService } from '@Services';

import getRoomName from './getRoomName';

export default function unlockResource(socket: Socket) {
  socket.on('unlock resource', async (eventId: number, model: string, resourceId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    const unlocked = await ResourceLockService.unlock(model, resourceId, clientId, eventId);
    if (!unlocked) {
      return cb('You can’t unlock this resource.');
    }

    socket.in(getRoomName(eventId)).emit('unlock resource', {
      eventId,
      model,
      resourceId,
      locker: clientId,
    });
  });
}

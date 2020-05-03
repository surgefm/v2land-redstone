import { Socket } from 'socket.io';
import { ResourceLockService } from '@Services';

import getRoomName from './getRoomName';

export default function unlockResource(socket: Socket) {
  socket.on('unlock resource', async (eventId: number, model: string, resourceId: number, cb: Function) => {
    // TODO: check user’s permission
    const clientId = socket.handshake.session.clientId;
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

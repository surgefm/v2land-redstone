import { Socket } from 'socket.io';
import { ResourceLockService } from '@Services';

import getRoomName from './getRoomName';

export default function lockResource(socket: Socket) {
  socket.on('lock resource', async (eventId: number, model: string, resourceId: number, cb: Function) => {
    // TODO: check user’s permission
    const clientId = socket.handshake.session.clientId;
    const locked = await ResourceLockService.lock(model, resourceId, clientId, eventId);
    if (!locked) {
      return cb('The resource has already been locked');
    }

    socket.in(getRoomName(eventId)).emit('lock resource', {
      eventId,
      model,
      resourceId,
      locker: clientId,
    });
  });
}

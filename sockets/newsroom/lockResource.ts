import { Socket } from 'socket.io';
import { ResourceLockService, AccessControlService } from '@Services';

import getRoomName from './getRoomName';

export default function lockResource(socket: Socket) {
  socket.on('lock resource', async (eventId: number, model: string, resourceId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
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
    cb();
  });
}

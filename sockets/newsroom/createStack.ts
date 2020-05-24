import { Socket } from 'socket.io';
import { StackObj } from '@Types';
import { StackService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function createStack(socket: Socket) {
  socket.on('create stack', async (eventId: number, data: StackObj, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    try {
      const stack = await StackService.createStack(eventId, data, clientId);
      socket.in(getRoomName(eventId)).emit('create stack', { stack });
      cb(null, { stack });
    } catch (err) {
      cb(err.message);
    }
  });
}

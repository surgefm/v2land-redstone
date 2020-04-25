import { Socket } from 'socket.io';
import { StackObj } from '@Types';
import { StackService } from '@Services';
import getRoomName from './getRoomName';

export default function createStack(socket: Socket) {
  socket.on('create stack', async (eventId: number, data: StackObj, cb: Function) => {
    // TODO: Check user permission.
    try {
      const stack = await StackService.createStack(eventId, data, socket.handshake.session.clientId);
      socket.in(getRoomName(eventId)).emit('create stack', stack);
    } catch (err) {
      cb(err.message);
    }
  });
}

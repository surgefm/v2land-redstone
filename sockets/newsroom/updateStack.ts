import { Socket } from 'socket.io';
import { StackService } from '@Services';
import { StackObj } from '@Types';
import getRoomName from './getRoomName';

export default function updateStack(socket: Socket) {
  socket.on('update stack', async (stackId: number, data: StackObj, cb: Function) => {
    // TODO: Check user’s permission

    try {
      const returnValue = await StackService.updateStack({
        id: stackId,
        data,
        clientId: socket.handshake.session.clientId,
      });

      if (returnValue.status === 201) {
        socket.to(getRoomName(returnValue.message.stack.eventId)).emit('update stack', returnValue.message.stack);
      }
    } catch (err) {
      cb(err.message);
    }
  });
}

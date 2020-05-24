import { Socket } from 'socket.io';
import { StackService, AccessControlService } from '@Services';
import { Stack } from '@Models';
import { StackObj } from '@Types';
import getRoomName from './getRoomName';

export default function updateStack(socket: Socket) {
  socket.on('update stack', async (stackId: number, data: StackObj, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    try {
      const returnValue = await StackService.updateStack({
        id: stackId,
        data,
        clientId,
      });

      if (returnValue.status === 201) {
        socket.to(getRoomName(returnValue.message.stack.eventId)).emit('update stack', returnValue.message.stack);
      }
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}

import { Socket } from 'socket.io';
import { Stack } from '@Models';
import { StackService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function removeEventFromStack(socket: Socket) {
  socket.on('remove event from stack', async (stackId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    try {
      const s = await StackService.removeEvent(stackId, clientId);
      if (s) {
        socket.in(getRoomName(stack.eventId)).emit('remove event from stack', { stackId });
      }
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}

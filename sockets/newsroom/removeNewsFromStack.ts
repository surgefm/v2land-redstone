import { Socket } from 'socket.io';
import { Stack } from '@Models';
import { StackService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function removeNewsFromStack(socket: Socket) {
  socket.on('remove news from stack', async (newsId: number, stackId: number, cb: Function = () => {}) => {
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    const esn = await StackService.removeNews(stackId, newsId, clientId);
    if (esn) {
      socket.in(getRoomName(stack.eventId)).emit('remove news from stack', {
        ...esn.get({ plain: true }),
        stackId,
      });
    }
    cb();
  });
}

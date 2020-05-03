import { Socket } from 'socket.io';
import { Stack } from '@Models';
import { StackService } from '@Services';
import getRoomName from './getRoomName';

export default function removeNewsFromStack(socket: Socket) {
  socket.on('remove news from stack', async (newsId: number, stackId: number) => {
    // TODO: Check user permission.
    const stack = await Stack.findByPk(stackId);
    const esn = await StackService.removeNews(stackId, newsId, socket.handshake.session.clientId);
    if (esn) {
      socket.in(getRoomName(stack.eventId)).emit('remove news from stack', esn);
    }
  });
}

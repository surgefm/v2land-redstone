import { Socket } from 'socket.io';
import { Stack } from '@Models';
import { StackService } from '@Services';
import getRoomName from './getRoomName';

export default function addNewsToStack(socket: Socket) {
  socket.on('add news to stack', async (newsId: number, stackId: number) => {
    // TODO: Check user permission.
    const stack = await Stack.findByPk(stackId);
    const esn = await StackService.addNews(stackId, newsId, socket.handshake.session.clientId);
    if (esn) {
      socket.in(getRoomName(stack.eventId)).emit('add news to stack', esn);
    }
  });
}

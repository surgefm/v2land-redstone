import { Socket } from 'socket.io';
import { Stack, News } from '@Models';
import { StackService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function addNewsToStack(socket: Socket) {
  socket.on('add news to stack', async (newsId: number, stackId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const news = await News.findByPk(newsId);
    if (!news) return cb('News not found');
    const esn = await StackService.addNews(stackId, newsId, clientId);
    if (esn) {
      socket.in(getRoomName(stack.eventId)).emit('add news to stack', {
        eventStackNews: esn,
        stack,
        news,
        client: socket.handshake.session.currentClient,
      });
    }
  });
}

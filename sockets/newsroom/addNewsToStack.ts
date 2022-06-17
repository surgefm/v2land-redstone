import { Socket } from 'socket.io';
import { Stack, News } from '@Models';
import { StackService, AccessControlService } from '@Services';

export default function addNewsToStack(socket: Socket) {
  socket.on('add news to stack', async (newsId: number, stackId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const stack = await Stack.findByPk(stackId);
    if (!stack) return cb('Stack not found');
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, stack.eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const news = await News.findByPk(newsId);
    if (!news) return cb('News not found');
    await StackService.addNews(stackId, newsId, clientId);
    cb();
  });
}

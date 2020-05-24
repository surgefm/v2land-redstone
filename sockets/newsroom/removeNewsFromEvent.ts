import { Socket } from 'socket.io';
import { EventService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function removeNewsFromEvent(socket: Socket) {
  socket.on('remove news from event', async (newsId: number, eventId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const esn = await EventService.removeNews(eventId, newsId, clientId);
    if (esn) {
      socket.in(getRoomName(eventId)).emit('remove news from event', esn);
    }
    cb();
  });
}

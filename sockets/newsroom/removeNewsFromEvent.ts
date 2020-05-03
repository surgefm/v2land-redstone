import { Socket } from 'socket.io';
import { EventService } from '@Services';
import getRoomName from './getRoomName';

export default function removeNewsFromEvent(socket: Socket) {
  socket.on('remove news from event', async (newsId: number, eventId: number) => {
    // TODO: Check user permission.
    const esn = await EventService.removeNews(eventId, newsId, socket.handshake.session.clientId);
    if (esn) {
      socket.in(getRoomName(eventId)).emit('remove news from event', esn);
    }
  });
}

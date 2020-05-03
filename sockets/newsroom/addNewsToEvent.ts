import { Socket } from 'socket.io';
import { Event } from '@Models';
import { EventService } from '@Services';
import getRoomName from './getRoomName';

export default function addNewsToEvent(socket: Socket) {
  socket.on('add news to event', async (newsId: number, eventId: number) => {
    // TODO: Check user permission.
    const event = await Event.findByPk(eventId);
    const esn = await EventService.addNews(eventId, newsId, socket.handshake.session.clientId);
    if (esn) {
      socket.in(getRoomName(event.id)).emit('add news to event', esn);
    }
  });
}

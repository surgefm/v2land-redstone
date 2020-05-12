import { Socket } from 'socket.io';
import { Event, News } from '@Models';
import { EventService } from '@Services';
import getRoomName from './getRoomName';

export default function addNewsToEvent(socket: Socket) {
  socket.on('add news to event', async (newsId: number, eventId: number, cb: Function) => {
    // TODO: Check user permission.
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const news = await News.findByPk(newsId);
    if (!news) return cb('News not found');
    const esn = await EventService.addNews(eventId, newsId, socket.handshake.session.clientId);
    if (esn) {
      socket.in(getRoomName(event.id)).emit('add news to event', {
        eventStackNews: esn,
        event,
        news,
        client: socket.handshake.session.currentClient,
      });
    }
  });
}

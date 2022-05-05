import { Socket } from 'socket.io';
import { Event, News, Client } from '@Models';
import { EventService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function addNewsToEvent(socket: Socket) {
  socket.on('add news to event', async (newsId: number, eventId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const news = await News.findByPk(newsId);
    if (!news) return cb('News not found');
    const esn = await EventService.addNews(eventId, newsId, clientId);
    if (esn) {
      socket.in(getRoomName(event.id)).emit('add news to event', {
        eventStackNews: esn,
        event,
        news,
        client: await Client.findByPk(clientId),
      });
    }
    cb();
  });
}

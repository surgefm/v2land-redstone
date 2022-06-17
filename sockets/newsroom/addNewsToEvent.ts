import { Socket } from 'socket.io';
import { Event, News } from '@Models';
import { EventService, AccessControlService } from '@Services';

export default function addNewsToEvent(socket: Socket) {
  socket.on('add news to event', async (newsId: number, eventId: number, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const news = await News.findByPk(newsId);
    if (!news) return cb('News not found');
    await EventService.addNews(eventId, newsId, clientId);
    cb();
  });
}

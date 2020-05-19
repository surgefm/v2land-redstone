import { Socket } from 'socket.io';
import { EventService, CommitService, AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function makeCommit(socket: Socket) {
  socket.on('make commit', async (eventId: number, summary: string, description: string, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');
    const event = await EventService.findEvent(eventId, { eventOnly: true });
    if (!event) return cb('Event not found');

    const commit = await CommitService.makeCommit(eventId, clientId, summary, { description });
    socket.in(getRoomName(eventId)).emit('make commit', { commit });
  });
}

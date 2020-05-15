import { Socket } from 'socket.io';
import { EventService, CommitService } from '@Services';
import getRoomName from './getRoomName';

export default function makeCommit(socket: Socket) {
  socket.on('make commit', async (eventId: number, summary: string, description: string, cb: Function) => {
    const event = await EventService.findEvent(eventId, { eventOnly: true });
    if (!event) {
      return cb('Event not found');
    }

    const commit = await CommitService.makeCommit(eventId, socket.handshake.session.clientId, summary, { description });
    socket.in(getRoomName(eventId)).emit('make commit', { commit });
  });
}

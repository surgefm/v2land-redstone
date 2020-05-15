import { Socket } from 'socket.io';
import { Event, Client } from '@Models';
import { AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function inviteManager(socket: Socket) {
  socket.on('invite manager', async (eventId: number, clientId: number, cb: Function) => {
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const client = await Client.findByPk(clientId);
    if (!client) return cb('Client not found');
    await AccessControlService.allowClientToViewEvent(clientId, eventId);
    socket.in(getRoomName(eventId)).emit('add manager', clientId);
  });
}
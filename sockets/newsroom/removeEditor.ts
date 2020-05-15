import { Socket } from 'socket.io';
import { Event, Client } from '@Models';
import { AccessControlService } from '@Services';
import getRoomName from './getRoomName';

export default function removeEditor(socket: Socket) {
  socket.on('remove editor', async (eventId: number, clientId: number, cb: Function) => {
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const client = await Client.findByPk(clientId);
    if (!client) return cb('Client not found');
    await AccessControlService.allowClientToViewEvent(clientId, eventId);
    socket.in(getRoomName(eventId)).emit('remove editor', clientId);
  });
}
import { Socket } from 'socket.io';
import { Event, Client } from '@Models';
import { AccessControlService } from '@Services';
import { hasRole } from '@Services/AccessControlService/operations';
import getRoomName from './getRoomName';

export default function inviteManager(socket: Socket) {
  socket.on('invite manager', async (eventId: number, clientId: number, cb: Function = () => {}) => {
    const ownerId = socket.handshake.session.clientId;
    const haveAccess = await hasRole(ownerId, AccessControlService.getEventOwnerRolePlain(eventId));
    if (!haveAccess) return cb('You are not allowed to invate managers to this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const client = await Client.findByPk(clientId);
    if (!client) return cb('Client not found');
    await AccessControlService.allowClientToManageEvent(clientId, eventId);
    socket.in(getRoomName(eventId)).emit('add manager', { eventId, clientId });
    cb();
  });
}

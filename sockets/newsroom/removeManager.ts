import { Server, Socket } from 'socket.io';
import { Event, Client } from '@Models';
import { AccessControlService, ResourceLockService } from '@Services';
import { hasRole } from '@Services/AccessControlService/operations';
import getRoomName from './getRoomName';
import removeClientFromNewsroom from './removeClientFromNewsroom';

export default function removeManager(socket: Socket, server: Server) {
  socket.on('remove manager', async (eventId: number, clientId: number, cb: Function = () => {}) => {
    const ownerId = socket.handshake.session.clientId;
    const haveAccess = await hasRole(ownerId, AccessControlService.getEventOwnerRolePlain(eventId));
    if (!haveAccess) return cb('You are not allowed to invate managers to this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const client = await Client.findByPk(clientId);
    if (!client) return cb('Client not found');
    await AccessControlService.disallowClientToManageEvent(clientId, eventId);
    socket.in(getRoomName(eventId)).emit('remove manager', { eventId, clientId });

    const resourceLocks = await ResourceLockService.unlockEventResourcesLockedByClient(eventId, clientId);
    if (resourceLocks.length > 0) {
      socket.in(getRoomName(eventId)).emit('unlock resources', { eventId, resourceLocks });
    }
    cb(null, { resourceLocks });
    await removeClientFromNewsroom(server, eventId, clientId);
  });
}

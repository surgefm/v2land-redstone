import { Socket } from 'socket.io';
import { Event, Client } from '@Models';
import { AccessControlService, ResourceLockService } from '@Services';
import getRoomName from './getRoomName';

export default function inviteViewer(socket: Socket) {
  socket.on('invite viewer', async (eventId: number, clientId: number, cb: Function = () => {}) => {
    const managerId = socket.handshake.session.clientId;
    const haveAccess = await AccessControlService.isAllowedToManageEvent(managerId, eventId);
    if (!haveAccess) return cb('You are not allowed to invite viewers to this event.');
    const event = await Event.findByPk(eventId);
    if (!event) return cb('Event not found');
    const client = await Client.findByPk(clientId);
    if (!client) return cb('Client not found');
    await AccessControlService.allowClientToViewEvent(clientId, eventId);
    socket.in(getRoomName(eventId)).emit('add viewer', { eventId, clientId });

    const resourceLocks = await ResourceLockService.unlockEventResourcesLockedByClient(eventId, clientId);
    if (resourceLocks.length > 0) {
      socket.in(getRoomName(eventId)).emit('unlock resources', { eventId, resourceLocks });
    }
    cb(null, { resourceLocks });
  });
}

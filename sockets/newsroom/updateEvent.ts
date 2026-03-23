import { Socket } from 'socket.io';
import { EventObj } from '@Types';
import { Client } from '@Models';
import { EventService, AccessControlService } from '@Services';
import { isClientEditor } from '@Services/AccessControlService/RoleAccessControl';

import getRoomName from './getRoomName';

export default function updateEvent(socket: Socket) {
  socket.on('update event information', async (eventId: number, data: EventObj, cb: Function = () => {}) => {
    const { clientId } = socket.handshake.session;
    const haveAccess = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!haveAccess) return cb('You are not allowed to edit this event.');

    const event = await EventService.findEvent(eventId, { eventOnly: true });
    if (!event) return cb('Event not found');

    // Status change permission logic:
    // - Global admins (editors): can set admitted/hidden/removed from any state
    // - Event owners: can set admitted/hidden, but NOT removed; cannot change if already removed
    if (data.status) {
      const isAdmin = await isClientEditor(clientId);
      if (isAdmin) {
        // Admin can set any status — no restrictions
      } else if (event.ownerId === clientId) {
        if (event.status === 'removed') {
          // Owner cannot change status once removed
          delete data.status;
        } else if (data.status === 'removed') {
          // Owner cannot set status to removed
          delete data.status;
        }
      } else {
        // Other roles cannot change status
        delete data.status;
      }
    }

    try {
      const e = await EventService.updateEvent(event, data, await Client.findByPk(clientId));
      const { id, name, description, status, needContributor } = e;
      if (e !== null) {
        socket.to(getRoomName(eventId)).emit('update event information', { event: { id, name, description, status, needContributor } });
      }
      cb();
    } catch (err) {
      cb(err.message);
    }
  });
}

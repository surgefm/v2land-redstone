import { Server } from 'socket.io';
import { ResourceLockService, AccessControlService } from '@Services';
import { isLoggedIn } from '@Sockets/middlewares';

import getRoomName from './getRoomName';

import addNewsToEvent from './addNewsToEvent';
import addNewsToStack from './addNewsToStack';
import createStack from './createStack';
import inviteEditor from './inviteEditor';
import inviteManager from './inviteManager';
import inviteViewer from './inviteViewer';
import lockResource from './lockResource';
import removeEditor from './removeEditor';
import removeManager from './removeManager';
import removeViewer from './removeViewer';
import removeNewsFromEvent from './removeNewsFromEvent';
import removeNewsFromStack from './removeNewsFromStack';
import unlockResource from './unlockResource';
import updateEvent from './updateEvent';
import updateStack from './updateStack';
import updateStackOrders from './updateStackOrders';

export default function loadNewsroom(io: Server) {
  const newsroom = io.of('/newsroom');
  newsroom.use(isLoggedIn);
  newsroom.on('connection', (socket) => {
    socket.on('join newsroom', async (eventId: number, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const hasAccess = await AccessControlService.isAllowedToViewEvent(clientId, eventId);
      if (!hasAccess) {
        return cb('You have no access to the event');
      }
      const roomName = getRoomName(eventId);
      socket.join(roomName);

      socket.in(roomName).emit('join room', socket.handshake.session.clientId);
      if (cb) {
        const resourceLocks = await ResourceLockService.getEventLockedResourceList(eventId);
        cb(null, { resourceLocks });
      }
    });

    socket.on('leave newsroom', (eventId: number) => {
      socket.leave(getRoomName(eventId));
      socket.in(getRoomName(eventId)).emit('leave room', socket.handshake.session.clientId);
    });

    addNewsToEvent(socket);
    addNewsToStack(socket);
    createStack(socket);
    inviteEditor(socket);
    inviteManager(socket);
    inviteViewer(socket);
    lockResource(socket);
    removeEditor(socket);
    removeManager(socket);
    removeViewer(socket);
    removeNewsFromEvent(socket);
    removeNewsFromStack(socket);
    unlockResource(socket);
    updateEvent(socket);
    updateStack(socket);
    updateStackOrders(socket);
  });
}

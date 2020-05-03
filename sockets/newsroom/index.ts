import { Server } from 'socket.io';
import { ResourceLockService } from '@Services';
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
  newsroom.on('connection', (socket) => {
    newsroom.use(isLoggedIn);

    socket.on('join newsroom', async (eventId: number, cb: Function) => {
      // TODO: Check user permission
      const roomName = getRoomName(eventId);
      socket.join(roomName);
      const resourceLockList = await ResourceLockService.getEventLockedResourceList(eventId);
      const roommates = newsroom.in(roomName).sockets;

      cb({
        lockedResourced: resourceLockList,
        clients: Object.keys(roommates).map(name => roommates[name].handshake.session.clientId),
      });

      socket.in(roomName).emit('join room', socket.handshake.session.clientId);
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

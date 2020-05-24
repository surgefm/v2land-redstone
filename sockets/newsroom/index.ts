import { Server } from 'socket.io';
import { ResourceLockService, AccessControlService, RedisService } from '@Services';
import { isLoggedIn } from '@Sockets/middlewares';
import _ from 'lodash';

import getRoomName from './getRoomName';

import addNewsToEvent from './addNewsToEvent';
import addNewsToStack from './addNewsToStack';
import createStack from './createStack';
import inviteEditor from './inviteEditor';
import inviteManager from './inviteManager';
import inviteViewer from './inviteViewer';
import lockResource from './lockResource';
import makeCommit from './makeCommit';
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

      const newsroomClient = {
        id: clientId,
        role: await AccessControlService.getClientEventRole(clientId, eventId),
      };

      socket.in(roomName).emit('join newsroom', {
        eventId,
        client: newsroomClient,
      });
      const resourceLocks = await ResourceLockService.getEventLockedResourceList(eventId);
      if (RedisService.redis) {
        newsroom.in(roomName).clients(async (err: Error, clients: string[]) => {
          if (err) throw err;
          clients = clients.map(client => `socket:${client}`);
          const clientIds = clients.length === 0 ? [] : _.uniq(await RedisService.mget(...clients));
          const newsroomClients = await Promise.all(clientIds.map(async clientId => ({
            id: clientId,
            role: await AccessControlService.getClientEventRole(clientId, eventId),
          })));
          cb(null, {
            resourceLocks,
            clients: newsroomClients,
          });
        });
      } else {
        cb(null, {
          resourceLocks,
          clients: [newsroomClient],
        });
      }
    });

    const leaveNewsroom = (eventId: number, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const rooms = typeof eventId === 'number'
        ? [getRoomName(eventId)]
        : Object.keys(socket.rooms).map(key => socket.rooms[key]);

      for (let i = 0; i < rooms.length; i++) {
        const split = rooms[i].split('-');
        socket.in(rooms[i]).emit('leave newsroom', {
          eventId: split[split.length - 1],
          client: { id: clientId },
        });
        socket.leave(rooms[i]);
      }

      cb();
    };

    socket.on('leave newsroom', leaveNewsroom);
    socket.on('disconnect', leaveNewsroom);

    addNewsToEvent(socket);
    addNewsToStack(socket);
    createStack(socket);
    inviteEditor(socket);
    inviteManager(socket);
    inviteViewer(socket);
    lockResource(socket);
    makeCommit(socket);
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

import { Server } from 'socket.io';
import { ResourceLockService, AccessControlService, RedisService } from '@Services';
import { isLoggedIn } from '@Sockets/middlewares';
import _ from 'lodash';

import getRoomName from './getRoomName';
import newsroomPath from './newsroomPath';

import addEventToStack from './addEventToStack';
import addEventToTag from './addEventToTag';
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
import removeEventFromStack from './removeEventFromStack';
import removeEventFromTag from './removeEventFromTag';
import removeNewsFromEvent from './removeNewsFromEvent';
import removeNewsFromStack from './removeNewsFromStack';
import unlockResource from './unlockResource';
import updateEvent from './updateEvent';
import updateHeaderImage from './updateHeaderImage';
import updateStack from './updateStack';
import updateStackOrders from './updateStackOrders';

export default function loadNewsroom(io: Server) {
  const newsroom = io.of(newsroomPath);
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
      await RedisService.hset(`socket:client-${clientId}-${eventId}`, socket.id, true);

      socket.in(roomName).emit('join newsroom', { eventId, clientId });
      const resourceLocks = await ResourceLockService.getEventLockedResourceList(eventId);
      const roles = await AccessControlService.getEventClients(eventId);
      if (RedisService.redis) {
        newsroom.in(roomName).clients(async (err: Error, clients: string[]) => {
          if (err) throw err;
          clients = clients.map(client => `socket:${client}`);
          const clientIds = clients.length === 0 ? [] : _.uniq(await RedisService.mget(...clients));
          cb(null, {
            resourceLocks,
            clients: clientIds,
            roles,
          });
        });
      } else {
        cb(null, {
          resourceLocks,
          clients: [clientId],
          roles,
        });
      }
    });

    const leaveNewsroom = async (eventId: number, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const rooms = typeof eventId === 'number'
        ? [getRoomName(eventId)]
        : Object.keys(socket.rooms).map(key => socket.rooms[key]);

      for (let i = 0; i < rooms.length; i++) {
        const split = rooms[i].split('-');
        const eventId = +split[split.length - 1];
        socket.in(rooms[i]).emit('leave newsroom', { eventId, clientId });
        socket.leave(rooms[i]);
        await RedisService.hdel(`socket:client-${clientId}-${eventId}`, socket.id);
      }

      cb();
    };

    socket.on('leave newsroom', leaveNewsroom);
    socket.on('disconnect', leaveNewsroom);

    addEventToStack(socket);
    addEventToTag(socket);
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
    removeEventFromStack(socket);
    removeEventFromTag(socket);
    removeNewsFromEvent(socket);
    removeNewsFromStack(socket);
    unlockResource(socket);
    updateEvent(socket);
    updateHeaderImage(socket);
    updateStack(socket);
    updateStackOrders(socket);
  });
}

import { Server } from 'socket.io';
import { isLoggedIn } from '@Sockets/middlewares';

import getRoomName from './getRoomName';

import addNewsToEvent from './addNewsToEvent';
import addNewsToStack from './addNewsToStack';
import createStack from './createStack';
import lockResource from './lockResource';
import unlockResource from './unlockResource';
import updateEvent from './updateEvent';
import updateStack from './updateStack';
import updateStackOrders from './updateStackOrders';

export default function loadNewsroom(io: Server) {
  const newsroom = io.of('/newsroom');
  newsroom.on('connection', (socket) => {
    newsroom.use(isLoggedIn);

    socket.on('join newsroom', (eventId: number) => {
      // TODO: Check user permission.
      socket.join(getRoomName(eventId));
    });

    socket.on('leave newsroom', (eventId: number) => {
      socket.leave(getRoomName(eventId));
    });

    addNewsToEvent(socket);
    addNewsToStack(socket);
    createStack(socket);
    lockResource(socket);
    unlockResource(socket);
    updateEvent(socket);
    updateStack(socket);
    updateStackOrders(socket);
  });
}

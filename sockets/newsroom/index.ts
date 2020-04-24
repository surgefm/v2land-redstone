import { Server } from 'socket.io';
import { isLoggedIn } from '@Sockets/middlewares';

import getRoomName from './getRoomName';
import updateEvent from './updateEvent';

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

    updateEvent(socket);
  });
}

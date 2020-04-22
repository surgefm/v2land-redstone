import { Server } from 'socket.io';
import { isLoggedIn } from '@Sockets/middlewares';

import loadNewsroom from './newsroom';

export function loadSocket(io: Server) {
  io.on('connection', async (socket) => {
    io.use(isLoggedIn);

    socket.on('hey', (cb) => {
      cb('🌊');
    });
  });

  loadNewsroom(io);
}

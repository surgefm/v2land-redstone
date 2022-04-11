import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisService } from '@Services';
import { isLoggedIn } from '@Sockets/middlewares';

import loadNewsroom from './newsroom';

export function loadSocket(io: Server) {
  if (RedisService.redis) {
    const pubClient = RedisService.classicRedis;
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.on('connection', async (socket) => {
    io.use(isLoggedIn);

    socket.on('hey', (cb) => {
      cb('🌊');
    });
  });

  loadNewsroom(io);
}

import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { isLoggedIn } from '@Sockets/middlewares';
import { redis, redisUrl } from '@Services/RedisService';

import loadNewsroom from './newsroom';

export async function loadSocket(io: Server) {
  if (redis) {
    const pubClient = createClient({ url: redisUrl });
    await pubClient.connect();
    const subClient = pubClient.duplicate();
    await subClient.connect();
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

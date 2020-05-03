import { Server } from 'socket.io';
import redisAdapter from 'socket.io-redis';
import { RedisService } from '@Services';
import { datastores } from '@Configs';
import { isLoggedIn } from '@Sockets/middlewares';

import loadNewsroom from './newsroom';

export function loadSocket(io: Server) {
  if (RedisService.redis) {
    io.adapter(redisAdapter(datastores.redis));
  }

  io.on('connection', async (socket) => {
    io.use(isLoggedIn);

    socket.on('hey', (cb) => {
      cb('🌊');
    });
  });

  loadNewsroom(io);
}

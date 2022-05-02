import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

import { isLoggedIn } from '@Sockets/middlewares';
import { redis, redisConfig } from '@Services/RedisService';

import loadNewsroom from './newsroom';

export let socket: Server;

export async function loadSocket(io?: Server) {
  if (socket) return socket;

  if (redis) {
    const pubClient = new Redis(redisConfig);
    const subClient = pubClient.duplicate();
    const key = process.env.NODE_ENV === 'production' ? 'surgefm-prod-' : 'surgefm-dev-';
    io.adapter(createAdapter(pubClient, subClient, { key }));
  }

  io.on('connection', async (socket) => {
    io.use(isLoggedIn);

    socket.on('hey', (cb) => {
      cb('🌊');
    });
  });

  loadNewsroom(io);
  socket = io;
}

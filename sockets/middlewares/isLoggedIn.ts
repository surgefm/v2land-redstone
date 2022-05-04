import { Socket } from 'socket.io';
import session from 'express-session';
import * as RedisService from '@Services/RedisService';
import { sessionConfig, sessionStore } from '@Configs/session';
import { Client } from '@Models';

const sess = session({
  ...sessionConfig,
  store: sessionStore(),
});

export default async function isLoggedIn(socket: Socket, next: ( err?: any ) => void) {
  if (!socket.handshake.session && socket.handshake.headers.cookie) {
    await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      sess(socket.handshake, { end: () => null }, resolve);
    });
  }

  if (!socket.handshake.session || !socket.handshake.session.clientId) {
    return next('Please sign in first');
  }

  const { clientId } = socket.handshake.session;
  const client = await Client.findByPk(clientId);
  socket.handshake.session.currentClient = client;
  await RedisService.set(`socket:${socket.id}`, clientId);
  next();
}

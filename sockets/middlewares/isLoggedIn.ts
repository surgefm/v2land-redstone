import { Socket } from 'socket.io';
import { Client } from '@Models';

export default async function isLoggedIn(socket: Socket, next: ( err?: any ) => void) {
  const { clientId } = socket.handshake.session;
  if (!clientId) {
    return next(new Error('Please sign in first'));
  }

  const client = await Client.findByPk(clientId);
  socket.handshake.session.currentClient = client;
  next();
}

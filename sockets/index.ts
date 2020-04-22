import { Server } from 'socket.io';

const id = (...args: any[]) => args;

export function loadSocket(io: Server) {
  io.on('connection', (socket) => {
    const sid = (socket.handshake as any).cookies['redstone.sid'];
    if (!sid) {
      return socket.emit('disconnect', 'Please sign in first');
    }
    socket.on('login', (a) => {
      socket.handshake.session.data = a;
      socket.handshake.session.save(id);
    });

    socket.on('hey', (input, cb) => {
      cb(socket.handshake.sessionID);
    });
  });
}

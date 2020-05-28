import { Socket } from 'socket.io';
import { RedisService } from '@Services';
import getRoomName from './getRoomName';
import newsroomPath from './newsroomPath';

async function removeClientFromNewsroom(socket: Socket, eventId: number, clientId: number) {
  const key = `socket:client-${clientId}-${eventId}`;
  const obj = await RedisService.hgetall(key);
  const socketIds = Object.keys(obj);
  const room = getRoomName(eventId);

  socket.server.of(newsroomPath).in(room).emit('leave newsroom', { eventId, clientId });

  for (const id of socketIds) {
    const s = socket.server.of(newsroomPath).sockets[id];
    if (s) {
      s.leave(room);
    }
    await RedisService.hdel(key, id);
  }
}

export default removeClientFromNewsroom;

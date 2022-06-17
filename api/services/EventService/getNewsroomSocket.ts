import newsroomPath from '@Sockets/newsroom/newsroomPath';
import getRoomName from '@Sockets/newsroom/getRoomName';

export default async function getNewsroomSocket(eventId: number) {
  const { loadSocket } = await import('@Sockets');
  const server = await loadSocket();
  return server.of(newsroomPath).in(getRoomName(eventId));
}

import { Server } from 'socket.io';
import * as ChatService from '@Services/ChatService';
import { isLoggedIn } from '@Sockets/middlewares';

import chatroomPath from './chatroomPath';

export default function loadChatroom(io: Server) {
  const newsroom = io.of(chatroomPath);
  newsroom.use(isLoggedIn);
  newsroom.on('connection', (socket) => {
    socket.on('join chatroom', async (type: 'client' | 'newsroom', ids: number | number[], cb: Function = () => {}) => {
      // const { clientId } = socket.handshake.session;
      const hasAccess = true;
      if (!hasAccess) {
        return cb('You have no access to the chatroom');
      }
      const roomName = ChatService.getChatId(type, ids);
      await socket.join(roomName);
      cb(null, {
        messages: await ChatService.loadMessages(type, ids),
      });
    });

    socket.on('send message', async (type: 'client' | 'newsroom', ids: number | number[], message: string, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const hasAccess = true;
      if (!hasAccess) {
        return cb('You have no access to the chatroom');
      }
      await ChatService.sendMessage(type, clientId, message, ids);
      cb();
    });
  });
}

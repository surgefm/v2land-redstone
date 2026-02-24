import { Server } from 'socket.io';
import * as ChatService from '@Services/ChatService';
import * as AccessControlService from '@Services/AccessControlService';
import { isLoggedIn } from '@Sockets/middlewares';

import chatroomPath from './chatroomPath';
import wrapSocket from '../wrapSocket';

const BOT_MENTION_PATTERN = /@bot\b/i;

export default function loadChatroom(io: Server) {
  const newsroom = io.of(chatroomPath);
  newsroom.use(isLoggedIn);
  newsroom.on('connection', (rawSocket) => {
    const socket = wrapSocket(rawSocket);
    socket.on('join chatroom', async (type: 'client' | 'newsroom', ids: number | number[], cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const hasAccess = type === 'client'
        ? await AccessControlService.isAllowedToViewClientChat(clientId, ids as number[])
        : await AccessControlService.isAllowedToViewNewsroomChat(clientId, ids as number);
      if (!hasAccess) {
        return cb('You don\'t have access to the chatroom');
      }
      const roomName = ChatService.getChatId(type, ids);
      await socket.join(roomName);
      cb(null, {
        messages: await ChatService.loadMessages(type, ids),
        members: await ChatService.getChatMembers(type, ids),
      });
    });

    socket.on('send message', async (type: 'client' | 'newsroom', ids: number | number[], message: string, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      const hasAccess = type === 'client'
        ? await AccessControlService.isAllowedToTalkTo(clientId, ids as number[])
        : await AccessControlService.isAllowedToChatInNewsroom(clientId, ids as number);
      if (!hasAccess) {
        return cb('You have no access to the chatroom');
      }
      await ChatService.sendMessage(type, clientId, message, ids);
      cb();

      // Detect @Bot mention in newsroom chats and trigger agent
      if (type === 'newsroom' && BOT_MENTION_PATTERN.test(message)) {
        handleBotMention(clientId, ids as number, message);
      }
    });

    socket.on('read message', async (messageId: string, cb: Function = () => {}) => {
      const { clientId } = socket.handshake.session;
      await ChatService.readMessage(clientId, messageId);
      cb();
    });
  });
}

async function handleBotMention(clientId: number, eventId: number, message: string) {
  try {
    // Only editors can instruct the bot
    const canEdit = await AccessControlService.isAllowedToEditEvent(clientId, eventId);
    if (!canEdit) return;

    const { AgentLock, run } = await import('@Services/AgentService');
    const locked = await AgentLock.isLocked(eventId);
    if (locked) {
      // Agent already running — push as mid-run correction
      await AgentLock.pushToInbox(eventId, message);
    } else {
      // Start a new agent run
      run(eventId, message).catch((err) => {
        console.error(`[Chatroom] Agent run error for event ${eventId}:`, err);
      });
    }
  } catch (err) {
    console.error(`[Chatroom] Error handling @Bot mention:`, err);
  }
}

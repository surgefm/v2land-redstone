import uuidv4 from 'uuid/v4';
import { ChatMessage, ChatMember } from '@Models';
import { getOrCreateChat, getChatSocket } from './utils';

export const sendMessage = async (type: 'client' | 'newsroom', authorId: number, message: string, ids: number | number[]) => {
  if (message.trim().length === 0) return;

  const chat = await getOrCreateChat(type as 'client', ids as number[]);
  const socket = await getChatSocket(type as 'client', ids as number[]);

  const data = {
    chatId: chat.id,
    clientId: authorId,
  };
  const existingChatMember = await ChatMember.findOne({ where: data });
  if (!existingChatMember) {
    await ChatMember.create({
      id: uuidv4(),
      ...data,
    });
  }

  const chatMessage = await ChatMessage.create({
    id: uuidv4(),
    chatId: chat.id,
    authorId,
    text: message,
  });

  socket.emit('send message', chatMessage.get({ plain: true }));
};

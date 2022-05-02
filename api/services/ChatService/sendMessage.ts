import { ChatMessage, ChatMember } from '@Models';
import { getOrCreateChat, getChatSocket } from './utils';

export const sendMessage = async (type: 'client' | 'newsroom', authorId: number, message: string, ids: number | number[]) => {
  const chat = await getOrCreateChat(type as 'client', ids as number[]);
  const socket = await getChatSocket(type as 'client', ids as number[]);

  if (type === 'newsroom') {
    const data = {
      chatId: chat.id,
      clientId: authorId,
    };
    const existingChatMember = await ChatMember.findOne({ where: data });
    if (!existingChatMember) await ChatMember.create(data);
  }

  const chatMessage = await ChatMessage.create({
    chatId: chat.id,
    authorId,
    message,
  });

  socket.emit('send message', chatMessage.get({ plain: true }));
};

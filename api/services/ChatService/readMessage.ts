import { ChatMessage, ChatMember } from '@Models';
import { getChatSocket } from './utils';

export const readMessage = async (clientId: number, messageId: string) => {
  const message = await ChatMessage.findByPk(messageId);
  if (!message) return;

  const chatMember = await ChatMember.findOne({
    where: {
      chatId: message.chatId,
      clientId,
    },
  });

  if (!chatMember) return;
  if (chatMember.lastRead < message.createdAt) {
    chatMember.lastRead = message.createdAt;
    await chatMember.save();

    const socket = await getChatSocket(message.chatId);
    socket.emit('client read', message.chatId, clientId, message.createdAt);
  }
};

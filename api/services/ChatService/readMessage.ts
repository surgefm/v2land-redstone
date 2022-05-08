import uuidv4 from 'uuid/v4';
import { ChatMessage, ChatMember } from '@Models';
import { getChatSocket } from './utils';

export const readMessage = async (clientId: number, messageId: string) => {
  const message = await ChatMessage.findByPk(messageId);
  if (!message) return;

  const data = {
    chatId: message.chatId,
    clientId,
  };

  let chatMember = await ChatMember.findOne({ where: data });
  if (!chatMember) {
    chatMember = await ChatMember.create({
      id: uuidv4(),
      ...data,
    });
  }

  if (!chatMember.lastRead || chatMember.lastRead < message.createdAt) {
    chatMember.lastRead = message.createdAt;
    await chatMember.save();

    const socket = await getChatSocket(message.chatId);
    socket.emit('client read', message.chatId, clientId, message.createdAt);
  }
};

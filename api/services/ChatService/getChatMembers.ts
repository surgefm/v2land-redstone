import { ChatMember } from '@Models';
import { getChatId } from './utils';

export const getChatMembers = async (type: 'client' | 'newsroom', ids: number | number[]) => {
  const chatId = getChatId(type, ids);

  const members = await ChatMember.findAll({
    where: { chatId },
  });

  return members;
};

import { ChatMessage, Sequelize } from '@Models';
import { getChatId } from './utils';

const { Op } = Sequelize;

type LoadMessagesOptions = {
  before?: Date;
}

export const loadMessages = async (type: 'client' | 'newsroom', ids: number | number[], {
  before,
}: LoadMessagesOptions = {}) => {
  const chatId = getChatId(type, ids);
  const where: Sequelize.WhereOptions = { chatId };
  if (before) {
    where.createdAt = { [Op.lte]: before };
  }

  const messages = await ChatMessage.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 30,
  });

  return messages;
};

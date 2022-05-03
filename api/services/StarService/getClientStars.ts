import { Star } from '@Models';

export const getClientStars = async (clientId: number) => {
  return Star.findAll({
    where: { clientId },
    order: [['createdAt', 'DESC']],
  });
};

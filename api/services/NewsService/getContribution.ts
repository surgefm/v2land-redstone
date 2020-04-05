import { Op, Transaction } from 'sequelize';
import { Client, Record } from '@Models';

async function getContribution (
  news: { id?: number; contribution?: Record[] },
  withData: boolean,
  { transaction }: { transaction?: Transaction} = {},
) {
  const records = await Record.findAll({
    attributes: withData ? undefined : {
      exclude: ['data', 'before'],
    },
    where: {
      action: {
        [Op.or]: ['updateNewsStatus', 'updateNewsDetail', 'createNews'],
      },
      target: news.id,
    },
    include: [{
      model: Client,
      as: 'client',
      required: false,
      attributes: ['username', 'role', 'id'],
    }],
    transaction,
  });

  return records;
}

export default getContribution;

const SeqModels = require('../../seqModels');
const { Op } = require('sequelize');

async function getContribution (news, withData, { transaction } = {}) {
  const records = await SeqModels.Record.findAll({
    attributes: withData ? undefined : {
      exclude: ['data', 'before'],
    },
    where: {
      action: {
        [Op.or]: ['updateNewsStatus', 'updateNewsDetail', 'createNews'],
      },
      target: news.id,
    },
    include: {
      model: SeqModels.Client,
      as: 'client',
      required: false,
      attributes: ['username', 'role', 'id'],
    },
    transaction,
  });

  return records;
}

module.exports = getContribution;

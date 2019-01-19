const SeqModels = require('../../../seqModels');
const { Op } = require('sequelize');

async function getContribution (stack, withData = true, { transaction } = {}) {
  const attributes = ['model', 'target', 'operation', 'owner'];
  if (withData) {
    attributes.push('before');
    attributes.push('data');
  }

  const records = await SeqModels.Record.findAll({
    where: {
      action: {
        [Op.or]: ['createStack', 'invalidateStack', 'updateStackStatus', 'updateStackDetail'],
      },
      target: stack.id,
    },
    attributes,
    include: [{
      model: SeqModels.Client,
      as: 'client',
      attributes: ['username', 'role', 'id'],
    }],
    transaction,
  });

  return records;
}

module.exports = getContribution;

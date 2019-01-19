const SeqModels = require('../../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function getContribution (event, withData = true) {
  const attributes = ['model', 'target', 'operation', 'owner'];
  if (withData) {
    attributes.push('before');
    attributes.push('data');
  }

  const records = await SeqModels.Record.findAll({
    attributes,
    where: {
      [Op.or]: [{
        action: {
          [Op.or]: ['createEvent', 'updateEventStatus', 'updateEventDetail'],
        },
        target: event.id,
      },
      event.headerImage ? {
        action: {
          [Op.or]: ['createEventHeaderImage', 'updateEventHeaderImage'],
        },
        target: typeof event.headerImage === 'number'
          ? event.headerImage
          : event.headerImage.id,
      } : undefined],
    },
    include: [{
      model: SeqModels.Client,
      attributes: ['username', 'role', 'id'],
    }],
    order: [['updatedAt', 'DESC']],
  });

  return records;
}

module.exports = getContribution;

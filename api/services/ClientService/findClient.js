const SeqModels = require('../../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function findClient (clientName, { transaction } = {}) {
  if (!['string', 'number'].includes(typeof clientName)) {
    return clientName;
  }

  let where;

  if (+clientName > 0) {
    where = {
      id: +clientName,
    };
  } else if (typeof clientName === 'string') {
    where = {
      [Op.or]: [
        { username: clientName },
        { email: clientName },
      ],
    };
  }

  const client = await SeqModels.Client.findOne({
    where,
    attributes: { exclude: ['password'] },
    include: [
      {
        as: 'auths',
        model: SeqModels.Auth,
        where: {
          profileId: { [Op.not]: null },
        },
        attributes: ['id', 'site', 'profileId', 'profile'],
        required: false,
      },
      {
        as: 'subscriptions',
        model: SeqModels.Subscription,
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        required: false,
      },
    ],
    transaction,
  });

  return client;
}

module.exports = findClient;

const SeqModels = require('../../../seqModels');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function findClient (clientName, { transaction, withAuths = true, withSubscriptions = true, withPassword = false } = {}) {
  if (!['string', 'number'].includes(typeof clientName)) {
    return clientName;
  }

  let where;

  if (+clientName > 0) {
    where = {
      id: +clientName,
    };
  } else if (typeof clientName === 'string') {
    clientName = clientName.trim();
    where = {
      [Op.or]: [
        { username: { [Op.iLike]: clientName } },
        { email: { [Op.iLike]: clientName } },
      ],
    };
  }

  const include = [];
  if (withAuths) {
    include.push({
      as: 'auths',
      model: SeqModels.Auth,
      where: {
        profileId: { [Op.not]: null },
      },
      attributes: ['id', 'site', 'profileId', 'profile'],
      required: false,
    });
  }
  if (withSubscriptions) {
    include.push({
      as: 'subscriptions',
      model: SeqModels.Subscription,
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      required: false,
      include: {
        model: SeqModels.Contact,
        where: { status: 'active' },
      },
    });
  }

  const client = await SeqModels.Client.findOne({
    where,
    attributes: { exclude: withPassword ? [] : ['password'] },
    include,
    transaction,
  });

  return client;
}

module.exports = findClient;

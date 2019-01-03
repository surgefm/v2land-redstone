const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const SeqModels = require('../../seqModels');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

module.exports = {

  findClient: async (clientName, { transaction } = {}) => {
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
  },

  /**
   * token generator
   */
  tokenGenerator: () => {
    const token = uuidv4();
    return crypto
      .createHash('sha256')
      .update(token, 'utf8')
      .digest('hex');
  },

  sanitizeClient: (client) => {
    const temp = {};
    for (const attr of ['username', 'role', 'id']) {
      temp[attr] = client[attr];
    }

    return temp;
  },

  validateSettings: async (settings) => {
    for (const attr of Object.keys(settings)) {
      switch (attr) {
      case 'defaultSubscriptionMethod':
        if (!['EveryNewStack', '30DaysSinceLatestStack'].includes(settings[attr])) {
          throw new Error(`'defaultSubscriptionMethod' 字段不得为 ${settings[attr]}`);
        }
        break;
      default:
        throw new Error(`不存在 '${attr}' 字段`);
      }
    }
  },

};

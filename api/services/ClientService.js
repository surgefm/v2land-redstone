const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

const SeqModels = require('../../seqModels');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

module.exports = {

  findClient: async (clientName, { transaction } = {}) => {
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
      include: [
        {
          as: 'auths',
          model: SeqModels.Auth,
          where: {
            profileId: { [Op.not]: null },
          },
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

    if (client === null) return null;

    const data = client.toJSON();

    // can use join

    // const client = await Client.findOne({
    //   or: [
    //     { id: parseInt(clientName) > -1 ? parseInt(clientName) : -1 },
    //     { username: clientName },
    //     { email: clientName },
    //   ],
    // })
    //   .populate('subscriptions', {
    //     where: { status: 'active' },
    //     sort: 'createdAt DESC',
    //   })
    //   .populate('auths', {
    //     where: { profileId: { '>=': 1 } },
    //   })
    //   .populate('events', {
    //     sort: 'updatedAt DESC',
    //   });

    delete data.password;
    delete data.records;
    for (let i = 0; i < data.auths.length; i++) {
      const auth = {};
      for (const attr of ['id', 'site', 'profileId', 'profile']) {
        auth[attr] = data.auths[i][attr];
      }
      const profile = {};
      for (const attr of ['screen_name', 'name', 'id', 'id_str']) {
        if (auth.profile[attr]) {
          profile[attr] = auth.profile[attr];
        }
      }
      auth.profile = profile;
      data.auths[i] = auth;
    }

    return data;
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

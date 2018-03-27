const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

module.exports = {

  findClient: async (clientName) => {
    const client = await Client.findOne({
      or: [
        { id: parseInt(clientName) > -1 ? parseInt(clientName) : -1 },
        { username: clientName },
        { email: clientName },
      ],
    })
      .populate('subscriptions', {
        where: { status: 'active' },
        sort: 'createdAt DESC',
      })
      .populate('auths', {
        where: { profileId: { '>=': 1 } },
      })
      .populate('events', {
        sort: 'updatedAt DESC',
      });

    const data = { ...client };
    if (!data.id) return null;
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
    for (const attr of ['username', 'role', 'id', 'events']) {
      temp[attr] = client[attr];
    }

    return temp;
  },

};

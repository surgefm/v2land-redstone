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
        select: ['id', 'site', 'profileId', 'profile'],
      })
      .populate('events', {
        sort: 'updatedAt DESC',
      });

    const data = { ...client };
    if (!data.id) return null;
    delete data.password;
    return data;
  },

  sanitizeClient: (client) => {
    const temp = {};
    for (const attr of ['username', 'role', 'id', 'events']) {
      temp[attr] = client[attr];
    }

    return temp;
  },

};

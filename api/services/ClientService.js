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
    delete data.password;

    return data;
  },

};

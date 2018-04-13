const StackService = {

  async findStack(id, withData = true) {
    const stack = await Stack.findOne({ id })
      .populate('news', {
        where: { status: 'admitted' },
        sort: 'time DESC',
        limit: 15,
      });

    stack.contribution = await StackService.getContribution(id, withData);

    return stack;
  },

  async getContribution(id, withData = true) {
    const select = ['model', 'target', 'operation', 'client'];
    if (withData) {
      select.push('before');
      select.push('data');
    }

    const records = await Record.find({
      action: ['updateStackStatus', 'updateStackDetail', 'createStack'],
      target: id,
      select,
    }).populate('client');

    for (const record of records) {
      if (record.client) {
        record.client = ClientService.sanitizeClient(record.client);
      }
    }

    return records;
  },

};

module.exports = StackService;

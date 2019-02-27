const SeqModels = require('../../seqModels');

const refineData = (data = {}) => {
  let model = data.model;
  model = model[0].toUpperCase() + model.slice(1);
  data.model = (model === 'Headerimage') ? 'HeaderImage' : model;
  data.createdAt = data.createdAt || new Date();
  data.updatedAt = data.updatedAt || new Date();
  if (data.client) {
    data.owner = data.client;
    delete data.client;
  }
  return data;
};

/**
 * model, action, target, owner, data, before
 */

const RecordService = {
  create: async (data, options) => {
    return SeqModels.Record.create({
      ...refineData(data),
      operation: 'create',
    }, options);
  },

  update: async (data, options) => {
    return SeqModels.Record.create({
      ...refineData(data),
      operation: 'update',
    }, options);
  },

  destroy: async (data, options) => {
    return SeqModels.Record.create({
      ...refineData(data),
      operation: 'destroy',
    }, options);
  },
};

module.exports = RecordService;

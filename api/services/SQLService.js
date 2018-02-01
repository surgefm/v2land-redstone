const Sequel = require('waterline-sequel');
const sequelOptions = {
  canReturnValues: true,
  escapeInserts: true,
};

const SQLService = {

  createRecord: async (pgClient, {
    model,
    operation,
    action,
    client,
    data,
    target,
    createdAt,
    updatedAt,
  }) => {
    createdAt = createdAt || (data ? data.createdAt : null) || new Date();
    updatedAt = updatedAt || (data ? data.updatedAt : null) || new Date();
    return await pgClient.query(`
      INSERT INTO record(model, operation, action, client, data, target, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [model, operation, action, client, data, target, createdAt, updatedAt]);
  },

  validate: async (model, data, presentOnly) => {
    model = model.toLowerCase();
    if (!sails.models[model]) {
      reject(new Error('未找到该模型'));
    }

    sails.models[model].validate(data, presentOnly, (err) => {
      if (err) throw err;
      return;
    });
  },

  cleanData: (model, data) => {
    const temp = {};
    for (const i in data) {
      if (sails.models[model].schema[i]) {
        temp[i] = data[i];
      }
    }
    return temp;
  },

  create: async ({ model, data, action, client }) => {
    model = model.toLowerCase();
    await SQLService.validate(model, data);
    const sequel = new Sequel(sails.models[model].schema, sequelOptions);

    const now = new Date();

    data = SQLService.cleanData(model, data);
    data.createdAt = now;
    data.updatedAt = now;
    const query = sequel.create(model, data);

    return await SQLService.query({
      model,
      action,
      client,
      operation: 'create',
      time: now,
      ...query,
    });
  },

  update: async ({ model, where, data, action, client }) => {
    try {
      model = model.toLowerCase();
      await SQLService.validate(model, data, true);
      const sequel = new Sequel(sails.models[model].schema, sequelOptions);

      const now = new Date();
      data = SQLService.cleanData(model, data);

      data.updatedAt = now;
      const query = sequel.create(model, data);

      console.log(query.query);
      return SQLService.query({
        model,
        action,
        client,
        operation: 'update',
        ...query,
      });
    } catch (err) {
      console.log(err);
    }
  },

  destroy: async ({ model, action, where, client }) => {
    const time = new Date();
    const sequel = new Sequel(sails.models[model].schema, sequelOptions);

    model = model.toLowerCase();

    where = SQLService.cleanData(model, where);
    const query = sequel.destroy(model, where);

    return SQLService.query({
      model,
      action,
      client,
      operation: 'destroy',
      time,
      ...query,
    });
  },

  query: async ({ model, operation, query, values, action, client, time }) => {
    const pg = await sails.pgPool.connect();

    try {
      await pg.query(`BEGIN`);

      const response = await pg.query(query, values);
      let object = response.rows[0];

      model = model[0].toUpperCase() + model.slice(1);
      model = (model === 'Headerimage') ? 'HeaderImage' : model;

      if (model.toLowerCase === 'auth') {
        object = {
          id: object.id,
          site: object.site,
          profileId: object.profileId,
          owner: object.owner,
        };
      } else if (model.toLowerCase === 'client') {
        delete object.password;
      }

      const record = {
        model,
        operation,
        action,
        client,
        data: object,
        target: object.id,
        createdAt: time,
        updatedAt: time,
      };
      await SQLService.validate('record', record);
      await SQLService.createRecord(pg, record);

      await pg.query(`COMMIT`);
      return object;
    } catch (err) {
      await pg.query(`ROLLBACK`);
      throw err;
    } finally {
      pg.release();
    }
  },

};

module.exports = SQLService;

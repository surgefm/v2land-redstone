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
    before,
    data,
    target,
    createdAt,
    updatedAt,
  }) => {
    createdAt = createdAt || (data ? data.createdAt : null) || new Date();
    updatedAt = updatedAt || (data ? data.updatedAt : null) || new Date();
    return await pgClient.query(`
      INSERT INTO record(model, operation, action, owner, data, before, target, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [model, operation, action, client, data, before, target, createdAt, updatedAt]);
  },

  validate: (model, data, presentOnly) => {
    return new Promise((resolve, reject) => {
      model = model.toLowerCase();
      if (!sails.models[model]) {
        reject(new Error('未找到该模型'));
      }

      sails.models[model].validate(data, presentOnly, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  },

  cleanData: (model, data) => {
    const temp = {};
    for (const i in data) {
      if (sails.models[model].schema[i]) {
        if (i !== 'time') temp[i] = data[i];
        else {
          if (data[i]) {
            const time = new Date(data[i]);
            temp[i] = time.toISOString();
          } else {
            temp[i] = null;
          }
        }
      }
    }
    return temp;
  },

  create: async ({ model, data, action, client, pg }) => {
    model = model.toLowerCase();
    await SQLService.validate(model, data);
    const sequel = new Sequel(sails.models, sequelOptions);

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
      pg,
      ...query,
    });
  },

  update: async ({ model, where, data, action, client, before, pg }) => {
    model = model.toLowerCase();
    await SQLService.validate(model, data, true);
    const sequel = new Sequel(sails.models, {
      schemaName: model,
      ...sequelOptions,
    });

    const now = new Date();
    data = SQLService.cleanData(model, data);

    data.updatedAt = now;
    const query = sequel.update(model, where, data);
    query.query = query.query.replace('  "', ' WHERE "');

    return SQLService.query({
      model,
      action,
      client,
      before,
      pg,
      operation: 'update',
      ...query,
    });
  },

  destroy: async ({ model, action, where, client, pg }) => {
    const time = new Date();
    model = model.toLowerCase();
    const sequel = new Sequel(sails.models, {
      schemaName: model,
      ...sequelOptions,
    });

    where = SQLService.cleanData(model, where);
    const query = sequel.destroy(model, where);
    query.query = query.query.replace('  "', ' WHERE "');
    query.query = 'DELETE ' + query.query.slice(query.query.indexOf('FROM'));

    return SQLService.query({
      model,
      action,
      client,
      operation: 'destroy',
      time,
      pg,
      ...query,
    });
  },

  query: async ({ before, model, operation, query, values, action, client, time, pg }) => {
    const releasePg = !pg;
    pg = pg || await sails.pgPool.connect();
    model = model.toLowerCase();
    const Model = sails.models[model];

    try {
      if (releasePg) {
        await pg.query(`BEGIN`);
      }

      const response = await pg.query(query, values);
      let object = response.rows[0];

      for (const i of Model.associations) {
        const Associate = sails.models[i.model];
        const sequel = new Sequel(sails.models, {
          schemaName: i.model,
          ...sequelOptions,
        });
        if (!i.collection) {
          let alias;
          for (const j of Associate.associations) {
            if (j.model === model) {
              alias = j.alias;
              break;
            }
          }
          if (!alias) break;
          const change = {};
          change[alias] = object.id;
          const q = sequel.update(i.model, {
            id: object[i.alias],
          }, change);
          q.query = q.query.replace('  "', ' WHERE "');
          await pg.query(q.query, q.values);
        }
      }

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
        owner: client,
        before,
        data: object,
        target: object.id,
        createdAt: time,
        updatedAt: time,
      };
      await SQLService.validate('record', record);
      await SQLService.createRecord(pg, record);

      if (releasePg) {
        await pg.query(`COMMIT`);
      }
      return object;
    } catch (err) {
      await SQLService.rollback(pg);
      throw err;
    } finally {
      if (releasePg) {
        pg.release();
      }
    }
  },

  find: async ({ model, where }) => {
    try {
      const pg = await sails.pgPool.connect();
      model = model.toLowerCase();
      where = UtilService.generateWhereQuery(where);
      const q = `SELECT * FROM ${model} WHERE ${where.query}`;
      const response = await pg.query(q, where.values);
      return response.rows;
    } catch (err) {
      throw err;
    } finally {
      pg.release();
    }
  },

  rollback: async (pg) => {
    if (!pg) return;
    await pg.query(`ROLLBACK`);
    pg.hasRolledBack = true;
  },

};

module.exports = SQLService;

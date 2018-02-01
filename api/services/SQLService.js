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

    const now = new Date();

    data = SQLService.cleanData(model, data);
    let dataSize = 0;
    let query = `INSERT INTO "${model}"(`;
    const values = [];
    for (const i in data) {
      if (!['createdAt', 'updatedAt', 'id', 'constructor'].includes(i) && data[i]) {
        query += `"${i}", `;
        dataSize++;
        if (i !== 'time') {
          values.push(data[i]);
        } else {
          values.push(new Date(data[i]));
        }
      }
    }
    query += `"createdAt", "updatedAt") VALUES (`;
    for (let i = 1; i <= dataSize; i++) {
      query += '$' + i + ', ';
    }
    query += '$' + (dataSize + 1) + ', $' + (dataSize + 1) + ') RETURNING *';

    values.push(now);
    return await SQLService.query({
      model,
      action,
      client,
      operation: 'create',
      query,
      values,
    });
  },

  update: async ({ model, where, data, action, client }) => {
    model = model.toLowerCase();
    await SQLService.validate(model, data, true);

    const now = new Date();

    data = SQLService.cleanData(model, data);
    const values = [];
    let query = `UPDATE ${model} SET `;
    for (const i in data) {
      if (!['createdAt', 'updatedAt', 'id', 'constructor'].includes(i) && data[i]) {
        query += `"${i}" = $${values.length + 1}, `;
        values.push(i !== 'time' ? data[i] : new Date(data[i]));
      }
    }

    query += `"updatedAt" = $${values.length + 1} WHERE `;
    values.push(now);

    for (const i in where) {
      if (where[i]) {
        query += `"${i}" = $${values.length + 1}, `;
        values.push(i !== 'time' ? where[i] : new Date(where[i]));
      }
    }
    query = query.slice(0, -2);

    query += ' RETURNING *';

    return SQLService.query({
      model,
      action,
      client,
      operation: 'update',
      query,
      values,
    });
  },

  destroy: async ({ model, action, where, client }) => {
    const time = new Date();

    model = model.toLowerCase();
    await SQLService.validate(model, where, true);

    where = SQLService.cleanData(model, where);
    const values = [];

    let query = `DELETE FROM ${model} WHERE `;
    for (const i in where) {
      if (where[i]) {
        query += `"${i}" = $${values.length + 1}, `;
        values.push(i !== 'time' ? where[i] : new Date(where[i]));
      }
    }

    query = query.slice(0, -2);
    query += ' RETURNING *';

    return SQLService.query({
      model,
      action,
      client,
      operation: 'destroy',
      query,
      values,
      time,
    });
  },

  query: async ({ model, operation, query, values, action, client, time }) => {
    const pg = await sails.pgPool.connect();

    try {
      await pg.query(`BEGIN`);

      const response = await pg.query(query, values);
      let object = response.rows[0];

      model = model[0].toUpperCase() + model.slice(1);
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

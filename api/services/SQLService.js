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
    const now = new Date();
    return pgClient.query(`
      INSERT INTO record(model, operation, action, client, data, target, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [model, operation, action, client, data, target, createdAt || now, updatedAt || now]);
  },

  validate: (model, data) => {
    return new Promise((resolve, reject) => {
      model = model.toLowerCase();
      if (!sails.models[model]) {
        reject(new Error('未找到该模型'));
      }

      sails.models[model].validate(data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
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
    try {
      await SQLService.validate(model, data);
    } catch (err) {
      throw err;
    }

    const now = new Date();

    data = SQLService.cleanData(model, data);
    let dataSize = 0;
    let query = `INSERT INTO "${model}"(`;
    for (const i in data) {
      if (!['createdAt', 'updatedAt', 'id'].includes(i) && data[i]) {
        query += `"${i}", `;
        dataSize++;
      }
    }
    query += `"createdAt", "updatedAt") VALUES (`;
    for (let i = 1; i <= dataSize; i++) {
      query += '$' + i + ', ';
    }
    query += '$' + (dataSize + 1) + ', $' + (dataSize + 1) + ') RETURNING *';
    const values = [];
    Object.getOwnPropertyNames(data).forEach((value, i) => {
      values[i] = data[value];
    });

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
    const now = new Date();

    data = SQLService.cleanData(model, data);
    let dataSize = 0;
    const values = [];
    let query = `UPDATE ${model} SET `;
    for (const i in data) {
      if (!['createdAt', 'updatedAt', 'id', 'constructor'].includes(i) && data[i]) {
        query += `"${i}" = $${++dataSize}, `;
        if (i !== 'time') {
          values.push(data[i]);
        } else {
          values.push(new Date(data[i]));
        }
      }
    }

    values.push(now);

    query += `"updatedAt" = $${dataSize + 1} WHERE `;
    for (const i in where) {
      if (where[i]) {
        query += `"${i}" = ${where[i]}, `;
      }
    }
    query = query.slice(0, -2);

    query += ' RETURNING *';

    console.log(query, values);

    return SQLService.query({
      model,
      action,
      client,
      operation: 'update',
      query,
      values,
    });
  },

  query: async ({ model, operation, query, values, action, client }) => {
    const pg = await sails.pgPool.connect();

    try {
      await pg.query(`BEGIN`);

      const response = await pg.query(query, values);
      const object = response.rows[0];

      model = model[0].toUpperCase() + model.slice(1);

      await SQLService.createRecord(pg, {
        model,
        operation,
        action,
        client,
        data: object,
        target: object.id,
        createdAt: object.updatedAt,
        updatedAt: object.updatedAt,
      });

      await pg.query(`COMMIT`);
      return object;
    } catch (err) {
      await pg.query(`ROLLBACK`);
      sails.log.error(err);
      throw err;
    } finally {
      pg.release();
    }
  },

};

module.exports = SQLService;

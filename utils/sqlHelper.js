
module.exports = {

  insertRecord(pgClient, { model, operation, action, client, data, target, createdAt, updatedAt }) {
    return pgClient.query(`
        INSERT INTO record(model, operation, action, client, data, target, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [model, operation, action, client, data, target, createdAt, updatedAt]);
  },

};

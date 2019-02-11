const es = require('elasticsearch');
const url = process.env.ES_URL;
const client = url ? new es.Client({ host: url }) : null;

module.exports = {

  client,

  search: async (query) => {
    return client ? client.search(query) : null;
  },

  update: (data) => new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.update(data, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  }),

  bulk: (query) => new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  }),

};

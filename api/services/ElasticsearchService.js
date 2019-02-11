const es = require('elasticsearch');
const url = process.env.ES_URL;
const client = url ? new es.Client({ host: url }) : null;

module.exports = {

  client,

  search: async (query) => {
    return client ? client.search(query) : null;
  },

  update: async (query) => {
    if (!client) return resolve();
    return client ? client.update(query) : null;
  },

  bulk: (query) => new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  }),

};

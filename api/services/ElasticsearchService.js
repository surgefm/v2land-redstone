const es = require('@elastic/elasticsearch');
const url = process.env.ES_URL;
const client = url ? new es.Client({ node: url }) : null;

module.exports = {

  client,

  search: async (query) => {
    return client ? client.search(query) : null;
  },

  update: async (query) => {
    return client ? client.update(query) : null;
  },

  bulk: (query) => new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  }),

  msearch: (query) => {
    return client ? client.msearch(query) : null;
  },

};

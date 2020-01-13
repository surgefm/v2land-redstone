const es = require('@elastic/elasticsearch');
const url = process.env.ES_URL;

export const client = url ? new es.Client({ node: url }) : null;

export async function search (query: any) {
  return client ? client.search(query) : null;
}

export async function update (query: any) {
  return client ? client.update(query) : null;
}

export async function bulk (query: any) {
  return new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err: Error, res: any[]) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export async function msearch (query: any) {
  return client ? client.msearch(query) : null;
}

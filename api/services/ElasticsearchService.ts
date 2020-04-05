import es from '@elastic/elasticsearch';
const url = process.env.ES_URL;

export const client = url ? new es.Client({ node: url }) : null;

export async function search (query: es.RequestParams.Search) {
  return client ? client.search(query) : null;
}

export async function update (query: es.RequestParams.Update) {
  return client ? client.update(query) : null;
}

export async function bulk (query: es.RequestParams.Bulk) {
  return new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err: Error, res: es.ApiResponse) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export async function msearch (query: es.RequestParams.Msearch) {
  return client ? client.msearch(query) : null;
}

export default {
  search,
  update,
  bulk,
  msearch,
};

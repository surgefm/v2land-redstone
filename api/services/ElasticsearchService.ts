/* eslint-disable camelcase */
import es from '@elastic/elasticsearch';
const url = process.env.ES_URL;

export const client = url ? new es.Client({ node: url }) : null;

export async function search(query: es.RequestParams.Search) {
  return client ? client.search(query) : null;
}

export async function update(query: es.RequestParams.Update) {
  return client ? client.update(query) : null;
}

export async function bulk(query: es.RequestParams.Bulk) {
  return new Promise((resolve, reject) => {
    if (!client) return resolve();
    client.bulk(query, (err: Error, res: es.ApiResponse) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

export async function msearch(query: es.RequestParams.Msearch) {
  return client ? client.msearch(query) : null;
}

export interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  _shards: ShardsResponse;
  hits: {
    total: number;
    max_score: number;
    hits: Array<{
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      _explanation?: Explanation;
      fields?: any;
      highlight?: any;
      inner_hits?: any;
      matched_queries?: string[];
      sort?: string[];
    }>;
  };
  aggregations?: any;
}

export interface ShardsResponse {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
}

export interface Explanation {
  value: number;
  description: string;
  details: Explanation[];
}

export interface SearchBody {
  query: Query;
}

export interface SearchBodyMultiMatch {
  query: QueryMultiMatch;
}

interface Query {
  match?: { query: string };
  filter?: object;
  from?: number;
  size?: number;
}

export interface QueryMultiMatch extends Query {
  multi_match?: {
    query: string;
    fields: string[];
  };
}

export default {
  search,
  update,
  bulk,
  msearch,
};

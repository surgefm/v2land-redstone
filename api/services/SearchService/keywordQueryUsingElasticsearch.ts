/* eslint-disable @typescript-eslint/camelcase */
import * as ElasticsearchService from '../ElasticsearchService';
import SearchType from './searchType';

async function keywordQueryUsingElasticsearch(
  keyword: string,
  type?: SearchType | SearchType[],
  from = 0,
  size = 20
) {
  if (!ElasticsearchService.client) return {};
  const searchBody: ElasticsearchService.SearchBodyMultiMatch = {
    query: {
      multi_match: {
        // Match title, abstract, etc.
        query: keyword,
        fields: ['title', 'abstract', 'content', 'author', 'name', 'description'],
      },
      from,
      size,
    },
  };

  // If search type is not provided, search among all types
  if (type === undefined) {
    const allSearchTypes = Object.keys(SearchType).map((k) => k as SearchType);
    type = allSearchTypes;
  }

  const { body } = await ElasticsearchService.client.search<
    // TODO: create a module to hold source type definition
    ElasticsearchService.SearchResponse<any>,
    ElasticsearchService.SearchBodyMultiMatch
  >({
    index: type,
    body: searchBody,
  });
  return body.hits;
}

export default keywordQueryUsingElasticsearch;

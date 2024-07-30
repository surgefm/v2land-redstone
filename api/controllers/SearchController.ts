import { RedstoneRequest, RedstoneResponse } from '@Types';
import { SearchService } from '@Services';
import { SearchType } from '../services/SearchService';

export async function keywordSearch(req: RedstoneRequest, res: RedstoneResponse) {
  const keyword = req.query.keyword as string;
  if (!keyword) {
    return res.status(400).json({
      message: 'Missing parameter: keyword.',
    });
  }

  const searchType = req.query.search_type as SearchType;
  if (searchType !== undefined && !Object.values(SearchType).includes(searchType)) {
    return res.status(500).json({
      message: 'Wrong parameter: search_type is invalid.',
    });
  }

  const { from, size } = req.query;

  const searchResults = await SearchService.keywordQueryUsingElasticsearch(keyword,
    searchType,
    parseInt(from as string || '0'),
    parseInt(size as string || '20'));
  return res.status(200).json({
    results: searchResults,
  });
}

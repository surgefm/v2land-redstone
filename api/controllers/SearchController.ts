import { RedstoneRequest, RedstoneResponse } from '@Types';
import { SearchService } from '@Services';

export async function keywordSearch(req: RedstoneRequest, res: RedstoneResponse) {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({
      message: 'Missing parameter: keyword.',
    });
  }

  const searchResults = await SearchService.keywordQueryUsingElasticsearch(keyword);
  return res.status(200).json({
    results: searchResults,
  });
}

import { News } from '@Models';
import ElasticsearchService from '../ElasticsearchService';

async function updateElasticsearchIndex({ news, newsId }: {
  news?: News;
  newsId?: number;
}) {
  if (!news) {
    news = await News.findOne({
      where: { id: newsId },
    });
  }

  let newsObj;
  if (news.get) {
    newsObj = news.get({ plain: true });
  }

  return ElasticsearchService.update({
    index: 'news',
    id: news.id,
    body: {
      'doc': newsObj,
      'doc_as_upsert': true,
    },
  });
}

export default updateElasticsearchIndex;

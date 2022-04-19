import { News } from '@Models';
import { updateNews, deleteNews } from '../AlgoliaService';

async function updateAlgoliaIndex({ news, newsId }: {
  news?: News;
  newsId?: number;
}) {
  if (!news) {
    news = await News.findOne({
      where: { id: newsId },
    });
  }

  if (!['admitted', 'pending'].includes(news.status)) {
    return deleteNews(news.id);
  }

  return updateNews(news);
}

export default updateAlgoliaIndex;

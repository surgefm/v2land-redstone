import { News } from '@Models';
import { updateNews } from '../AlgoliaService';

async function updateAlgoliaIndex({ news, newsId }: {
  news?: News;
  newsId?: number;
}) {
  if (!news) {
    news = await News.findOne({
      where: { id: newsId },
    });
  }

  return updateNews(news);
}

export default updateAlgoliaIndex;

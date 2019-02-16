const SeqModels = require('../../../seqModels');

async function updateElasticsearchIndex({ news, newsId }) {
  if (!news) {
    news = await SeqModels.News.findOne({
      where: { id: newsId },
    });
  }

  if (news.get) {
    news = news.get({ plain: true });
  }

  return ElasticsearchService.update({
    index: 'news',
    type: 'news',
    id: news.id,
    body: news,
  });
}

module.exports = updateElasticsearchIndex;

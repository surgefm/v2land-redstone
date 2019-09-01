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
    id: news.id,
    body: {
      'doc': news,
      'doc_as_upsert': true,
    },
  });
}

module.exports = updateElasticsearchIndex;

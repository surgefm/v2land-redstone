const SeqModels = require('../../../seqModels');

async function getNews (req, res) {
  let id;
  if (req.body && req.body.news) {
    id = req.body.news;
  } else if (req.query && req.query.news) {
    id = req.query.news;
  } else if (req.param('news')) {
    id = req.param('news');
  }

  if (!id) {
    return res.status(400).json({
      message: '缺少参数：news。',
    });
  }

  let news = await SeqModels.News.findOne({
    where: { id },
    include: [{
      model: SeqModels.Stack,
      as: 'stack',
    }],
  });
  if (!news) {
    return res.status(404).json({ message: '未找到该新闻' });
  }
  news = news.get({ plain: true });

  if (news.status !== 'admitted') {
    if (req.session.clientId) {
      const client = await SeqModels.Client.findById(req.session.clientId);
      if (!client || !['manager', 'admin'].includes(client.role)) {
        return res.status(404).json({ message: '该新闻尚未通过审核' });
      }
    } else {
      return res.status(404).json({ message: '该新闻尚未通过审核' });
    }
  }

  news.contribution = await NewsService.getContribution(news, true);
  res.status(200).json({ news });
}

module.exports = getNews;

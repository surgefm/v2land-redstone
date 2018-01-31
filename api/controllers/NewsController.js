/**
 * NewsController
 *
 * @description :: Server-side logic for managing news
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  getAllPendingNews: async (req, res) => {
    const newsCollection = await News.find({
      status: 'pending',
    });

    return res.status(200).json({ newsCollection });
  },

  updateNews: async (req, res) => {
    const id = req.param('news');
    const data = req.body;

    let news = await News.findOne({ id });

    if (!news) {
      return res.status(404).json({
        message: '未找到该新闻',
      });
    }

    for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status']) {
      news[i] = data[i];
    }

    try {
      const query = {
        client: req.session.clientId,
        where: { id: news.id },
        model: 'news',
      };
      if (data.status) {
        news = await SQLService.update({
          action: 'updateNewsStatus',
          data: { status: data.status },
          ...query,
        });
      }

      delete data.status;
      if (Object.getOwnPropertyNames(data).length > 0) {
        news = await SQLService.update({
          action: 'updateNewsDetail',
          data: news,
          ...query,
        });
      }

      res.status(201).json({
        message: '修改成功',
        news,
      });
    } catch (err) {
      return res.status(err.status).json(err);
    }
  },

};

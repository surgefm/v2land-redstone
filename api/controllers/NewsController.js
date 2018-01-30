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

    const news = await News.findOne({ id });

    if (!news) {
      return res.status(404).json({
        message: '未找到该新闻',
      });
    }

    for (const i of ['url', 'source', 'title', 'abstract', 'time', 'status']) {
      news[i] = data[i];
    }

    try {
      await news.save();
      res.status(201).json({
        message: '修改成功',
        news,
      });
    } catch (err) {
      return res.status(err.status).json(err);
    }

    const record = {
      model: 'News',
      operation: 'update',
      target: news.id,
      data: news,
      client: req.session.clientId,
    };

    if (data.status) {
      record.action = 'updateNewsStatus',
      await Record.create(record);
    }

    delete data.status;
    if (JSON.stringify(data) !== '{}') {
      record.action = 'updateNewsDetail';
      await Record.create();
    }
  },

};

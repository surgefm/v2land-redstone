const SeqModels = require('../../../seqModels');

async function getAllPendingNews (req, res) {
  const newsCollection = await SeqModels.News.findAll({
    where: {
      status: 'pending',
    },
  });

  return res.status(200).json({ newsCollection });
}

module.exports = getAllPendingNews;

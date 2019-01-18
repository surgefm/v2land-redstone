const SeqModels = require('../../../seqModels');

async function getPendingNews (req, res) {
  const name = req.param('eventName');
  const event = await EventService.findEvent(name);

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const newsCollection = await SeqModels.News.findAll({
    where: {
      eventId: event.id,
      status: 'pending',
    },
  });

  return res.status(200).json({ newsCollection });
}

module.exports = getPendingNews;

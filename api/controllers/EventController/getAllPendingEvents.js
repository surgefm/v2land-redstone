const SeqModels = require('../../../seqModels');

async function getAllPendingEvents (req, res) {
  const eventCollection = await SeqModels.Event.findAll({
    where: { status: 'pending' },
    sort: [['createdAt', 'ASC']],
  });
  res.status(200).json({ eventCollection });
}

module.exports = getAllPendingEvents;

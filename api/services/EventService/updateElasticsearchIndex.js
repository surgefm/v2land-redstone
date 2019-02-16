const SeqModels = require('../../../seqModels');

async function updateElasticsearchIndex({ event, eventId }) {
  if (!event) {
    event = await SeqModels.Event.findOne({
      where: { id: eventId },
      include: {
        model: SeqModels.HeaderImage,
        as: 'headerImage',
        required: false,
      },
    });
  }

  if (event.get) {
    event = event.get({ plain: true });
  }

  return ElasticsearchService.update({
    index: 'events',
    type: 'event',
    id: event.id,
    body: event,
  });
}

module.exports = updateElasticsearchIndex;

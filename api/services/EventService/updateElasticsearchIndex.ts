import { Event, HeaderImage } from '@Models';
import { EventObj } from '@Types';
import * as ElasticsearchService from '../ElasticsearchService';

async function updateElasticsearchIndex({ event, eventId }: {
  event?: EventObj;
  eventId?: number;
}) {
  if (!event) {
    event = await Event.findOne({
      where: { id: eventId },
      include: [{
        model: HeaderImage,
        as: 'headerImage',
        required: false,
      }],
    });
  }

  if (event.get) {
    event = event.get({ plain: true });
  }

  return ElasticsearchService.update({
    index: 'events',
    id: event.id,
    body: {
      'doc': event,
      'doc_as_upsert': true,
    },
  });
}

export default updateElasticsearchIndex;

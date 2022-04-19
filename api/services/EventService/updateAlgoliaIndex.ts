import { Event, HeaderImage } from '@Models';
import { EventObj } from '@Types';
import { updateEvent } from '../AlgoliaService';

async function updateAlgoliaIndex({ event, eventId }: {
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

  return updateEvent(event);
}

export default updateAlgoliaIndex;

import { Event, Client, HeaderImage } from '@Models';
import { EventObj } from '@Types';

import { sanitizeClient } from '../ClientService';
import { updateEvent, deleteEvent } from '../AlgoliaService';

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
      }, {
        model: Client,
        as: 'owner',
        required: true,
      }],
    });
  }

  if (event.status !== 'admitted') {
    return deleteEvent(event.id);
  }

  if (event.get) event = event.get({ plain: true });

  event.owner = sanitizeClient(event.owner);

  return updateEvent(event);
}

export default updateAlgoliaIndex;

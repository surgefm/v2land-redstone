import { Transaction } from 'sequelize';

import { Event, Client, HeaderImage } from '@Models';
import { EventObj } from '@Types';

import { sanitizeClient } from '../ClientService';
import { updateEvent, deleteEvent } from '../AlgoliaService';

async function updateAlgoliaIndex({ event, eventId, transaction }: {
  event?: EventObj;
  eventId?: number;
  transaction?: Transaction;
}) {
  event = await Event.findOne({
    where: { id: event ? event.id : eventId },
    include: [{
      model: HeaderImage,
      as: 'headerImage',
      required: false,
    }, {
      model: Client,
      as: 'owner',
      required: true,
    }],
    transaction,
  });

  if (event.status !== 'admitted') {
    return deleteEvent(event.id);
  }

  if (event.get) event = event.get({ plain: true });

  event.owner = sanitizeClient(event.owner);

  return updateEvent(event);
}

export default updateAlgoliaIndex;

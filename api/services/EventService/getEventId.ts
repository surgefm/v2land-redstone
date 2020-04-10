import { Event } from '@Models';
import _ from 'lodash';

async function getEventId(eventName: string | number): Promise<number> {
  const where = _.isNaN(+eventName) ? { name: eventName } : { id: +eventName };

  const event = await Event.findOne({
    attributes: ['id'],
    where,
  });

  return event ? event.id : null;
}

export default getEventId;

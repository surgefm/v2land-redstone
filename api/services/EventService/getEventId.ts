import { Event } from '@Models';
import * as ClientService from '@Services/ClientService';
import * as RedisService from '@Services/RedisService';
import _ from 'lodash';

async function getEventId(eventName: string | number | { [key: string]: string }, clientName?: string | number): Promise<number> {
  let name = eventName as string;
  let username = clientName;

  if (typeof eventName === 'object') {
    name = eventName.eventName;
    username = eventName.username;
  }

  if (typeof name === 'number') return name;
  if (!_.isNaN(+name)) return +name;

  const redisKey = RedisService.getEventIdKey(name, username);
  const redisRes = await RedisService.get(redisKey);
  if (redisRes) return redisRes;

  const event = await Event.findOne({
    attributes: ['id'],
    where: {
      name,
      ownerId: await ClientService.getClientId(username),
    },
  });

  if (!event) return null;
  await RedisService.set(redisKey, event.id);

  return event.id;
}

export default getEventId;

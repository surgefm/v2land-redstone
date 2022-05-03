import uuidv4 from 'uuid/v4';

import { Star } from '@Models';
import * as RedisService from '@Services/RedisService';
import { countStars } from './countStars';
import { getKey } from './utils';

export const star = async (eventId: number, clientId: number) => {
  const existing = await Star.findOne({
    where: { eventId, clientId },
  });
  if (existing) return existing;

  await countStars(eventId); // Update cache
  const s = await Star.create({
    id: uuidv4(),
    eventId,
    clientId,
  });
  await RedisService.incr(getKey(eventId));
  s.isNewRecord = true;
  return s;
};

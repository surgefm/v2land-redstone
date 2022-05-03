import { Star } from '@Models';
import * as RedisService from '@Services/RedisService';
import { countStars } from './countStars';
import { getKey } from './utils';

export const unstar = async (eventId: number, clientId: number) => {
  const existing = await Star.findOne({
    where: { eventId, clientId },
  });
  if (!existing) return;
  await countStars(eventId); // Update cache
  await existing.destroy();
  await RedisService.decr(getKey(eventId));

  return;
};

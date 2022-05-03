import { Star } from '@Models';
import * as RedisService from '@Services/RedisService';
import { getKey } from './utils';

export const countStars = async (eventId: number) => {
  const key = getKey(eventId);
  const cache = await RedisService.get(key);
  if (cache !== undefined) return cache;
  const count = await Star.count({ where: { eventId } });
  await RedisService.set(key, count);
  return count;
};

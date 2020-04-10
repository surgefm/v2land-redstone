import Redis from 'ioredis';
import { datastores } from '@Configs';

let redis: Redis.Redis;
if (process.env.REDIS_HOST) {
  redis = new Redis(datastores.redis);
}

async function get(key: string) {
  if (!redis) return;
  const data = await redis.get(datastores.redis.prefix + key);
  if (!data) return;
  return JSON.parse(data);
}

async function set(key: string, value: any) {
  if (!redis) return;
  return redis.set(datastores.redis.prefix + key, JSON.stringify(value));
}

export { redis, get, set };

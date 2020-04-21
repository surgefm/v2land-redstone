import Redis from 'ioredis';
import ClassicRedis from 'redis';
import { datastores } from '@Configs';

let redis: Redis.Redis;
let classicRedis: ClassicRedis.RedisClient;
if (process.env.REDIS_HOST) {
  redis = new Redis(datastores.redis);
  classicRedis = ClassicRedis.createClient(datastores.redis);
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

export { redis, classicRedis, get, set };

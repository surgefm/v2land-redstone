import Redis from 'ioredis';
import ClassicRedis from 'redis';
import { datastores } from '@Configs';

let redis: Redis.Redis;
let classicRedis: ClassicRedis.RedisClient;
if (process.env.REDIS_HOST) {
  redis = new Redis(datastores.redis);
  classicRedis = ClassicRedis.createClient(datastores.redis);
}

export async function get(key: string) {
  if (!redis) return;
  const data = await redis.get(datastores.redis.prefix + key);
  if (!data) return;
  return JSON.parse(data);
}

export async function set(key: string, value: any) {
  if (!redis) return;
  return redis.set(datastores.redis.prefix + key, JSON.stringify(value));
}

export async function hget(key: string, field: string) {
  if (!redis) return;
  const data = await redis.hget(datastores.redis.prefix + key, field);
  if (!data) return;
  return JSON.parse(data);
}

export async function hset(key: string, field: string, value: any) {
  if (!redis) return;
  return redis.hset(datastores.redis.prefix + key, field, JSON.stringify(value));
}

export { redis, classicRedis };

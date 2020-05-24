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

export async function del(key: string) {
  if (!redis) return;
  return redis.del(datastores.redis.prefix + key);
}

export async function mget(...keys: string[]) {
  if (!redis) return;
  if (keys.length === 0) return [];
  keys = keys.map(key => (datastores.redis.prefix + key));
  const data = await redis.mget(...keys);
  return data.map(d => d ? JSON.parse(d) : null);
}

export async function hget(key: string, field: string) {
  if (!redis) return;
  const data = await redis.hget(datastores.redis.prefix + key, field);
  if (!data) return;
  return JSON.parse(data);
}

export async function hgetall(key: string) {
  if (!redis) return;
  const data = await redis.hgetall(datastores.redis.prefix + key);
  if (!data) return;
  const ret: { [index: string]: any } = {};
  const keys = Object.keys(data);
  for (const key of keys) {
    ret[key] = JSON.parse(data[key]);
  }
  return ret;
}

export async function hset(key: string, field: string, value: any) {
  if (!redis) return;
  return redis.hset(datastores.redis.prefix + key, field, JSON.stringify(value));
}

export async function hdel(key: string, field: string) {
  if (!redis) return;
  return redis.hdel(datastores.redis.prefix + key, field);
}

export { redis, classicRedis };

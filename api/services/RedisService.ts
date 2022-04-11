import { createClient, RedisClientType } from 'redis';
import { datastores } from '@Configs';

const config = datastores.redis;
export const redisUrl = `rediss://${config.username}:${config.password}@${config.host}:${config.port}`;
export const classicRedis: RedisClientType = process.env.REDIS_HOST ? createClient({ url: redisUrl }) : null;
export const redis = classicRedis;

export function getClientIdKey(clientName: string) {
  return `client-name-mem-${(clientName || '').toLowerCase()}`;
}

export function getEventIdKey(eventName: string, clientName: string | number) {
  return `event-name-mem-${eventName}@${(clientName + '').toLowerCase()}`;
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

export async function expire(key: string, seconds: number) {
  if (!redis) return;
  return redis.expire(datastores.redis.prefix + key, seconds);
}

export async function mget(...keys: string[]) {
  if (!redis) return;
  if (keys.length === 0) return [];
  keys = keys.map(key => (datastores.redis.prefix + key));
  const data = await redis.mGet(keys);
  return data.map(d => d ? JSON.parse(d) : null);
}

export async function hget(key: string, field: string) {
  if (!redis) return;
  const data = await redis.hGet(datastores.redis.prefix + key, field);
  if (!data) return;
  return JSON.parse(data);
}

export async function hgetall(key: string) {
  if (!redis) return;
  const data = await redis.hGetAll(datastores.redis.prefix + key);
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
  return redis.hSet(datastores.redis.prefix + key, field, JSON.stringify(value));
}

export async function hdel(key: string, field: string) {
  if (!redis) return;
  return redis.hDel(datastores.redis.prefix + key, field);
}

export async function lpush(key: string, ...values: any[]) {
  if (!redis) return;
  return redis.lPush(datastores.redis.prefix + key, values.map(value => JSON.stringify(value)));
}

export async function rpush(key: string, ...values: any[]) {
  if (!redis) return;
  return redis.rPush(datastores.redis.prefix + key, values.map(value => JSON.stringify(value)));
}

export async function lrange(key: string, start = 0, end = -1) {
  if (!redis) return [];
  return redis.lRange(datastores.redis.prefix + key, start, end);
}

export async function lpop(key: string) {
  if (!redis) return;
  const result = await redis.lPop(datastores.redis.prefix + key);
  if (!result) return result;
  return JSON.parse(result);
}

export async function rpop(key: string) {
  if (!redis) return;
  const result = await redis.rPop(datastores.redis.prefix + key);
  if (!result) return result;
  return JSON.parse(result);
}

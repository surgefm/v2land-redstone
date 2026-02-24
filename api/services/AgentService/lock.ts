import * as RedisService from '../RedisService';

const LOCK_TTL = 300; // 5 minutes

function lockKey(eventId: number) {
  return `agent-lock:${eventId}`;
}

function inboxKey(eventId: number) {
  return `agent-inbox:${eventId}`;
}

function stopKey(eventId: number) {
  return `agent-stop:${eventId}`;
}

export async function acquireLock(eventId: number): Promise<boolean> {
  if (!RedisService.redis) return false;
  const key = RedisService.redis.options?.keyPrefix
    ? lockKey(eventId)
    : lockKey(eventId);
  const result = await RedisService.redis.set(
    key,
    JSON.stringify({ startedAt: new Date().toISOString(), status: 'running' }),
    'EX',
    LOCK_TTL,
    'NX',
  );
  return result === 'OK';
}

export async function releaseLock(eventId: number): Promise<void> {
  if (!RedisService.redis) return;
  await Promise.all([
    RedisService.redis.del(lockKey(eventId)),
    RedisService.redis.del(inboxKey(eventId)),
    RedisService.redis.del(stopKey(eventId)),
  ]);
}

export async function refreshLock(eventId: number): Promise<void> {
  if (!RedisService.redis) return;
  await RedisService.redis.expire(lockKey(eventId), LOCK_TTL);
}

export async function isLocked(eventId: number): Promise<boolean> {
  if (!RedisService.redis) return false;
  const val = await RedisService.redis.get(lockKey(eventId));
  return val !== null;
}

export async function pushToInbox(eventId: number, message: string): Promise<void> {
  if (!RedisService.redis) return;
  await RedisService.redis.rpush(inboxKey(eventId), message);
  await RedisService.redis.expire(inboxKey(eventId), LOCK_TTL);
}

export async function drainInbox(eventId: number): Promise<string[]> {
  if (!RedisService.redis) return [];
  const messages: string[] = [];
  while (true) {
    const msg = await RedisService.redis.lpop(inboxKey(eventId));
    if (!msg) break;
    messages.push(msg);
  }
  return messages;
}

export async function requestStop(eventId: number): Promise<void> {
  if (!RedisService.redis) return;
  await RedisService.redis.set(stopKey(eventId), '1', 'EX', LOCK_TTL);
}

export async function shouldStop(eventId: number): Promise<boolean> {
  if (!RedisService.redis) return false;
  const val = await RedisService.redis.get(stopKey(eventId));
  return val !== null;
}

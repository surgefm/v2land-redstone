import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus } from '@Types';
import { globals } from '@Configs';
import getRedisResourceLockKey from './getRedisResourceLockKey';
import getRedisEventResourceLockKey from './getRedisEventResourceLockKey';

const ttl = globals.resourceLockTTL;

export default async function lock(model: string, resourceId: number, clientId: number, eventId: number) {
  if (RedisService.redis) {
    const key = getRedisResourceLockKey(model, resourceId);
    const lock = await RedisService.get(key);
    if (lock && lock.locker !== clientId) return;
    if (!lock) {
      await RedisService.set(key, {
        clientId,
        eventId,
      });
      await RedisService.hset(getRedisEventResourceLockKey(eventId), key, true);
    }
    await RedisService.redis.expire(key, ttl);
    return;
  } else {
    const lock = await ResourceLock.findOne({
      where: {
        model,
        resourceId,
        status: ResourceLockStatus.ACTIVE,
        expires: { [Sequelize.Op.lt]: Date.now() },
      },
      attributes: ['locker', 'expires'],
    });
    if (lock) {
      if (lock.locker !== clientId) return;
      lock.expires = new Date(Date.now() + ttl * 1000);
      await lock.save();
      return;
    }

    await ResourceLock.create({
      model,
      resourceId,
      status: ResourceLockStatus.ACTIVE,
      expires: new Date(Date.now() + ttl * 1000),
      eventId,
      locker: clientId,
    });
  }
}

import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus, ResourceLockObj } from '@Types';
import getRedisResourceLockKey from './getRedisResourceLockKey';
import getRedisEventResourceLockKey from './getRedisEventResourceLockKey';

export default async function unlock(model: string, resourceId: number, clientId: number, eventId: number) {
  if (RedisService.redis) {
    const key = getRedisResourceLockKey(model, resourceId);
    const value: ResourceLockObj = await RedisService.get(key);
    if (!value || value.locker !== clientId) return;
    await RedisService.redis.del(key);
    await RedisService.redis.hdel(getRedisEventResourceLockKey(eventId), key);
  } else {
    const lock = await ResourceLock.findOne({
      where: {
        model,
        resourceId,
        status: ResourceLockStatus.ACTIVE,
        expires: { [Sequelize.Op.lt]: Date.now() },
      },
    });
    if (!lock || lock.locker !== clientId) return;
    lock.status = ResourceLockStatus.UNLOCKED;
    await lock.save();
  }
}

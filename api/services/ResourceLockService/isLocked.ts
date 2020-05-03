import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus, ResourceLockObj } from '@Types';
import getRedisResourceLockKey from './getRedisResourceLockKey';

export default async function isLocked(model: string, resourceId: number, clientId?: number) {
  const lock: ResourceLockObj = RedisService.redis
    ? await RedisService.get(getRedisResourceLockKey(model, resourceId))
    : await ResourceLock.findOne({
      where: {
        model,
        resourceId,
        status: ResourceLockStatus.ACTIVE,
        expires: { [Sequelize.Op.lt]: Date.now() },
      },
      attributes: ['locker'],
    });

  if (!lock) return false;
  if (clientId && lock.locker === clientId) return false;
  return true;
}

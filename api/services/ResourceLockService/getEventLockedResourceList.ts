import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus, ResourceLockObj } from '@Types';
import getRedisEventResourceLockKey from './getRedisEventResourceLockKey';

export default async function getEventLockedResourceList(eventId: number) {
  if (RedisService.redis) {
    const { redis } = RedisService;
    const eventKey = getRedisEventResourceLockKey(eventId);
    const fields = await redis.hgetall(eventKey);
    const keys = Object.keys(fields);
    const values = await redis.mget(...keys);
    const results: ResourceLockObj[] = [];
    await Promise.all(values.map((valueStr, index) => {
      return new Promise<void>(resolve => {
        if (!valueStr) {
          redis.hdel(eventKey, keys[index]).then(() => resolve());
        } else {
          const strings = keys[index].split('-');
          const value: ResourceLockObj = JSON.parse(valueStr);
          results.push({
            model: strings[strings.length - 2],
            resourceId: +strings[strings.length - 1],
            ...value,
          });
        }
      });
    }));
    return results;
  } else {
    const resourceLocks: ResourceLockObj[] = await ResourceLock.findAll({
      where: {
        eventId,
        status: ResourceLockStatus.ACTIVE,
        expires: { [Sequelize.Op.lt]: Date.now() },
      },
      attributes: ['eventId', 'model', 'resourceId', 'locker'],
    });
    return resourceLocks;
  }
}

import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus, ResourceLockObj } from '@Types';
import getRedisEventResourceLockKey from './getRedisEventResourceLockKey';

export default async function getEventLockedResourceList(eventId: number) {
  if (RedisService.redis) {
    const eventKey = getRedisEventResourceLockKey(eventId);
    const fields = await RedisService.hgetall(eventKey);
    const keys = Object.keys(fields);
    if (keys.length === 0) return [];
    const values: ResourceLockObj[] = await RedisService.mget(...keys);
    const results: ResourceLockObj[] = values.map((value, index) => {
      const strings = keys[index].split('-');
      return {
        model: strings[strings.length - 2],
        resourceId: +strings[strings.length - 1],
        ...value,
      };
    });
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

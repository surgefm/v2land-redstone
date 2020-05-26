import * as RedisService from '@Services/RedisService';
import { ResourceLock, Sequelize } from '@Models';
import { ResourceLockStatus, ResourceLockObj } from '@Types';
import getEventLockedResourceList from './getEventLockedResourceList';
import unlock from './unlock';

export default async function unlockEventResourcesLockedByClient(eventId: number, clientId: number) {
  if (RedisService.redis) {
    const resourceLocks = await getEventLockedResourceList(eventId);
    const unlockedResources = resourceLocks.filter(l => l.locker === clientId);
    await Promise.all(unlockedResources.map(lock => unlock(lock.model, lock.resourceId, clientId, eventId)));
    return unlockedResources;
  } else {
    const resourceLocks = await ResourceLock.findAll({
      where: {
        eventId,
        owner: clientId,
        status: ResourceLockStatus.ACTIVE,
        expires: { [Sequelize.Op.lt]: Date.now() },
      },
      attributes: ['eventId', 'model', 'resourceId', 'locker'],
    });
    await Promise.all(resourceLocks.map(lock => lock.destroy()));
    return resourceLocks as ResourceLockObj[];
  }
}

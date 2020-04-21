import Acl from 'acl';

import * as RedisService from '../RedisService';

const storageBackend: Acl.Backend<any> = RedisService.classicRedis
  ? new Acl.redisBackend(RedisService.classicRedis, 'v2land-acl')
  : new Acl.memoryBackend();

const acl = new Acl(storageBackend);

acl.allow('guests', 'events', 'view');

export default acl;

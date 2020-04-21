import Acl from 'acl';
import AclSeq from 'acl-sequelize';
import * as RedisService from '../RedisService';
import { sequelize } from '@Models';

const storageBackend: Acl.Backend<any> = RedisService.classicRedis
  ? new Acl.redisBackend(RedisService.classicRedis, 'v2land-acl')
  : new AclSeq(sequelize, { prefix: 'acl_' });

const acl = new Acl(storageBackend);

export default acl;

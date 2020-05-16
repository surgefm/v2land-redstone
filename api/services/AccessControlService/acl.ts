import Acl from 'acl';
import AclSeq from 'acl-sequelize';
import * as RedisService from '../RedisService';
import { sequelize, Sequelize } from '@Models';

const storageBackend: Acl.Backend<any> = RedisService.classicRedis
  ? new Acl.redisBackend(RedisService.classicRedis, 'v2land-acl')
  : new AclSeq(sequelize, {
    prefix: 'acl_',
    defaultSchema: {
      key: { type: Sequelize.STRING, primaryKey: true },
      value: { type: Sequelize.TEXT },
    },
    schema: {
      users: {
        key: { type: Sequelize.INTEGER, primaryKey: true },
        value: { type: Sequelize.TEXT },
      },
    },
  });

const acl = new Acl(storageBackend);

export default acl;

import dotenv from 'dotenv';
dotenv.config();

import Acl from 'acl';
import AclSeq from 'acl-sequelize';
import Redis from 'ioredis';
import { sequelize, Sequelize } from '@Models';
import { datastores } from '@Configs';
import RedisBackend from './redisBackend';

const config = datastores.redis;
const useTls = process.env.REDIS_SSL !== 'false';
const redisAuth = config.password ? `${config.username}:${config.password}@` : '';
const aclRedisConfig: any = useTls
  ? `${useTls ? 'rediss' : 'redis'}://${redisAuth}${config.host}:${config.port}`
  : { host: config.host, port: config.port, db: (config as any).db || 0 };
const redis = process.env.REDIS_HOST
  ? new Redis(aclRedisConfig)
  : null;

const storageBackend: Acl.Backend<any> = config.host
  ? new RedisBackend(redis, 'surge-acl') as any as Acl.Backend<any>
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
(acl as any).redis = redis;

export default acl;

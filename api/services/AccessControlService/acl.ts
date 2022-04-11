import dotenv from 'dotenv';
dotenv.config();

import Acl from 'acl';
import AclSeq from 'acl-sequelize';
import { createClient } from 'redis';
import { sequelize, Sequelize } from '@Models';
import { datastores } from '@Configs';
import RedisBackend from './redisBackend';

const config = datastores.redis;
const url = `rediss://${config.username}:${config.password}@${config.host}:${config.port}`;
const redis = process.env.REDIS_HOST ? createClient({ url, legacyMode: true }) : null;

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

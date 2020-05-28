import dotenv from 'dotenv';
dotenv.config();

import Acl from 'acl';
import AclSeq from 'acl-sequelize';
import ClassicRedis from 'redis';
import { sequelize, Sequelize } from '@Models';
import { datastores } from '@Configs';

const storageBackend: Acl.Backend<any> = process.env.HOST
  ? new Acl.redisBackend(ClassicRedis.createClient(datastores.redis), 'v2land-acl')
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

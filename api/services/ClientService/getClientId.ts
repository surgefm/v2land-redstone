import { Client, Sequelize } from '@Models';
import * as RedisService from '@Services/RedisService';
import _ from 'lodash';

async function getClientId(clientName: string | number): Promise<number> {
  if (typeof clientName === 'number') return clientName;
  if (!_.isNaN(+clientName)) return +clientName;

  const redisKey = RedisService.getClientIdKey(clientName);
  const redisRes = await RedisService.get(redisKey);
  if (redisRes) return redisRes;

  const client = await Client.findOne({
    attributes: ['id'],
    where: {
      username: {
        [Sequelize.Op.iLike]: clientName,
      },
    },
  });

  if (!client) return null;
  await RedisService.set(redisKey, client.id);

  return client.id;
}

export default getClientId;

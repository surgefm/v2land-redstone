import { Auth, Subscription, Contact, Client } from '@Models';
import { Transaction, Op, Includeable } from 'sequelize';
import * as StarService from '@Services/StarService';

import getEventsClientContributedTo from './getEventsClientContributedTo';

async function findClient(
  clientName: string | number | Client,
  {
    transaction,
    withAuths = true,
    withSubscriptions = true,
    withEvents = false,
    withStars = false,
    withPassword = false,
    forceUpdate = false,
  }: {
    transaction?: Transaction;
    withAuths?: boolean;
    withSubscriptions?: boolean;
    withEvents?: boolean;
    withStars?: boolean;
    withPassword?: boolean;
    forceUpdate?: boolean;
  } = {}) {
  if (clientName instanceof Client) {
    if (forceUpdate) {
      clientName = clientName.id;
    } else {
      return clientName;
    }
  }

  let where;

  if (+clientName > 0) {
    where = {
      id: +clientName,
    };
  } else if (typeof clientName === 'string') {
    clientName = clientName.trim();
    where = {
      [Op.or]: [
        { username: { [Op.iLike]: clientName } },
        { email: { [Op.iLike]: clientName } },
      ],
    };
  }

  const include: Includeable[] = [];
  if (withAuths) {
    include.push({
      as: 'auths',
      model: Auth,
      where: {
        profileId: { [Op.not]: null },
      },
      attributes: ['id', 'site', 'profileId', 'profile'],
      required: false,
    });
  }

  if (withSubscriptions) {
    include.push({
      as: 'subscriptions',
      model: Subscription,
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      required: false,
      include: [{
        model: Contact,
        where: { status: 'active' },
      }],
    });
  }

  const client = await Client.findOne({
    where,
    attributes: { exclude: withPassword ? [] : ['password'] },
    include,
    transaction,
  });

  if (withEvents) {
    client.events = await getEventsClientContributedTo(client.id);
  }

  if (withStars) {
    client.stars = await StarService.getClientStars(client.id);
  }

  return client;
}

export default findClient;

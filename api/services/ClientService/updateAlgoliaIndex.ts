import { Client } from '@Models';
import { Transaction } from 'sequelize';
import { updateClient } from '../AlgoliaService';
import sanitizeClient from './sanitizeClient';

async function updateAlgoliaIndex(
  { client, clientId, transaction }:
  { client?: Client; clientId: number; transaction?: Transaction } |
  { client: Client; clientId?: number; transaction?: Transaction },
) {
  if (!client) {
    client = await Client.findOne({
      where: { id: clientId },
      transaction,
    });
  }

  let clientObj: any = client;
  if (client.get) {
    clientObj = client.get({ plain: true });
  }

  clientObj = sanitizeClient(clientObj);

  return updateClient(clientObj);
}

export default updateAlgoliaIndex;

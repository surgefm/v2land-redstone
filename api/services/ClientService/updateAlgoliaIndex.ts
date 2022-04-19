import { Client } from '@Models';
import { updateClient } from '../AlgoliaService';
import sanitizeClient from './sanitizeClient';

async function updateAlgoliaIndex(
  { client, clientId }: { client?: Client; clientId: number } | {client: Client; clientId?: number},
) {
  if (!client) {
    client = await Client.findOne({
      where: { id: clientId },
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

import { Client } from '@Models';
import ElasticsearchService from '../ElasticsearchService';
import sanitizeClient from './sanitizeClient';

async function updateElasticsearchIndex(
  { client, clientId }: { client?: Client; clientId: number } | {client: Client; clientId?: number},
) {
  if (!client) {
    client = await Client.findOne({
      where: { id: clientId },
    });
  }

  let clientObj: any;
  if (client.get) {
    clientObj = client.get({ plain: true });
  }

  clientObj = sanitizeClient(clientObj);

  return ElasticsearchService.update({
    index: 'clients',
    id: client.id,
    body: {
      'doc': clientObj,
      'doc_as_upsert': true,
    },
  });
}

export default updateElasticsearchIndex;

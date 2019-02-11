const SeqModels = require('../../../seqModels');
const sanitizeClient = require('./sanitizeClient');

async function updateElasticsearchIndex({ client, clientId }) {
  if (!client) {
    client = await SeqModels.Client.findOne({
      where: { id: clientId },
    });
  }

  if (client.get) {
    client = client.get({ plain: true });
  }

  client = sanitizeClient(client);

  return ElasticsearchService.update({
    index: 'clients',
    type: 'client',
    id: client.id,
    body: client,
  });
}

module.exports = updateElasticsearchIndex;

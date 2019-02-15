const findClient = require('../ClientService/findClient');

async function isAdmin (client) {
  if (!client) return false;
  client = await findClient(client);
  return client.role === 'admin';
}

module.exports = isAdmin;

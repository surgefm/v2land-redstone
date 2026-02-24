import { Client } from '@Models';
import * as ClientService from '../ClientService';
import * as AccessControlService from '../AccessControlService';

let cachedBotClientId: number | null = null;

export async function getOrCreateBotClient(): Promise<Client> {
  if (cachedBotClientId) {
    const client = await Client.findByPk(cachedBotClientId);
    if (client) {
      guardRole(client);
      return client;
    }
    cachedBotClientId = null;
  }

  let client = await Client.findOne({ where: { username: 'bot' } });

  if (!client) {
    client = await ClientService.createClient({
      username: 'bot',
      nickname: 'Bot',
      email: 'bot@surge.fm',
      emailVerified: true,
    });

    await AccessControlService.allowClientToEditRole(client.id, client.id);
    await AccessControlService.addUserRoles(client.id, AccessControlService.roles.contributors);
  }

  guardRole(client);
  cachedBotClientId = client.id;
  return client;
}

function guardRole(client: Client) {
  if (client.role === 'admin' || client.role === 'manager') {
    throw new Error(
      `Bot account has disallowed role '${client.role}'. ` +
      `The @Bot account must never be admin or manager.`
    );
  }
}

export function getBotClientId(): number | null {
  return cachedBotClientId;
}

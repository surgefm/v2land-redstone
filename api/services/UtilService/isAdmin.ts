import { Client } from '@Models';
import { findClient } from '../ClientService';

async function isAdmin (clientId: number | string | Client) {
  if (!clientId) return false;
  const client = await findClient(clientId);
  return client.role === 'admin';
}

export default isAdmin;

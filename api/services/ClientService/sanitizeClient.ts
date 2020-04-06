import { Client } from '@Models';

interface SanitizedClient {
  username: string;
  role: string;
  id: number;
  description: string;
}

function sanitizeClient (client: Client): SanitizedClient {
  const temp: { [index: string]: any } = {};
  for (const attr of ['username', 'role', 'id', 'description']) {
    temp[attr] = (client as any)[attr];
  }

  return temp as SanitizedClient;
}

export default sanitizeClient;

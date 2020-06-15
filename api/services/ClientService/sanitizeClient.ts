import { Client } from '@Models';

interface SanitizedClient {
  username: string;
  nickname: string;
  avatar: string;
  id: number;
  description: string;
}

export const sanitizedFields = ['username', 'nickname', 'id', 'description', 'avatar'];

function sanitizeClient(client: Client): SanitizedClient {
  const temp: { [index: string]: any } = {};
  for (const attr of sanitizedFields) {
    temp[attr] = (client as any)[attr];
  }

  return temp as SanitizedClient;
}

export default sanitizeClient;

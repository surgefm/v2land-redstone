import { Client, Event } from '@Models';

interface SanitizedClient {
  username: string;
  nickname: string;
  avatar: string;
  id: number;
  description: string;
  events: Event[];
}

export const sanitizedFields = ['username', 'nickname', 'id', 'description', 'avatar'];

function sanitizeClient(client: Client): SanitizedClient {
  const temp: { [index: string]: any } = {};
  for (const attr of [...sanitizedFields, 'events']) {
    temp[attr] = (client as any)[attr];
  }

  return temp as SanitizedClient;
}

export default sanitizeClient;

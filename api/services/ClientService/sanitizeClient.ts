import { Client, Event } from '@Models';

interface SanitizedClient {
  username: string;
  nickname: string;
  avatar: string;
  id: number;
  description: string;
  role: string;
  events: Event[];
  objectID?: number;
}

export const sanitizedFields = ['username', 'nickname', 'id', 'description', 'avatar', 'role'];

function sanitizeClient(client: Client): SanitizedClient {
  const temp: { [index: string]: any } = {};
  for (const attr of [...sanitizedFields, 'events']) {
    temp[attr] = (client as any)[attr];
  }

  if ((client as any).objectID) {
    temp.objectID = (client as any).objectID;
  }

  return temp as SanitizedClient;
}

export default sanitizeClient;

import { Client, Event } from '@Models';

export interface SanitizedClient {
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
const otherFields = [
  'email', 'emailVerified', 'settings', 'records', 'auths',
  'subscriptions', 'contacts', 'reports', 'tags', 'events', 'subscriptionCount',
];

function sanitizeClient(client: Client, forAdmin = false): SanitizedClient {
  const temp: { [index: string]: any } = {};
  for (const attr of [...sanitizedFields, 'events', 'stars']) {
    temp[attr] = (client as any)[attr];
  }

  if (forAdmin) {
    for (const attr of otherFields) {
      temp[attr] = (client as any)[attr];
    }
  }

  if ((client as any).objectID) {
    temp.objectID = (client as any).objectID;
  }

  return temp as SanitizedClient;
}

export default sanitizeClient;

import { addUserRoles } from '@Services/AccessControlService/operations';
import { getNewsEditRole } from './getNewsRoles';

export default async function allowClientToEditNews(clientId: number, newsId: number) {
  return addUserRoles(clientId, await getNewsEditRole(newsId));
}

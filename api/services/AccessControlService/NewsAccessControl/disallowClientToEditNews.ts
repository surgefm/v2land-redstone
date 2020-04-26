import { removeUserRoles } from '../operations';
import { getNewsEditRolePlain } from './getNewsRoles';

export default async function allowClientToEditNews(clientId: number, newsId: number) {
  return removeUserRoles(clientId, getNewsEditRolePlain(newsId));
}

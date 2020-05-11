import { addUserRoles } from '@Services/AccessControlService/operations';
import { getRoleEditRole } from './getRoleRoles';

export default async function allowClientToEditNews(clientId: number, targetClientId: number) {
  return addUserRoles(clientId, await getRoleEditRole(targetClientId));
}

import { hasRole } from '../operations';
import { admins, managers, editors } from '../roles';

export default async function isClientEditor(clientId: number) {
  if (await hasRole(clientId, admins)) return true;
  if (await hasRole(clientId, managers)) return true;
  return hasRole(clientId, editors);
}

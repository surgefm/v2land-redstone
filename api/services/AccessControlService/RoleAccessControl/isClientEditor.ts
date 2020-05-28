import { hasRole } from '../operations';
import { admins, editors } from '../roles';

export default async function isClientEditor(clientId: number) {
  if (await hasRole(clientId, admins)) return true;
  return hasRole(clientId, editors);
}

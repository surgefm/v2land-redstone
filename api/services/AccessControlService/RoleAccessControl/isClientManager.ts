import { hasRole } from '../operations';
import { admins, managers } from '../roles';

export default async function isClientManager(clientId: number) {
  if (await hasRole(clientId, admins)) return true;
  return hasRole(clientId, managers);
}

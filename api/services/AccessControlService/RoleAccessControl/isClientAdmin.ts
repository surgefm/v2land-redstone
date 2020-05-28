import { hasRole } from '../operations';
import { admins } from '../roles';

export default async function isClientAdmin(clientId: number) {
  return hasRole(clientId, admins);
}

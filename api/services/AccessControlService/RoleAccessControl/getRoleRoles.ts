import { allow, areAnyRolesAllowed } from '@Services/AccessControlService/operations';

function getRoleResourceId(clientId: number) {
  return `role-${clientId}`;
}

export const getRoleEditRolePlain = (clientId: number) => `${getRoleResourceId(clientId)}-edit-role`;

export async function getRoleEditRole(clientId: number, forceUpdate = false) {
  const resource = getRoleResourceId(clientId);
  const editRole = getRoleEditRolePlain(clientId);

  const permissions = ['edit'];
  const isAllowed = await areAnyRolesAllowed(editRole, resource, permissions);
  if (!isAllowed || forceUpdate) {
    await allow(editRole, resource, permissions);
  }
  return editRole;
}

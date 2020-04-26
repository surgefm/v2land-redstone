import { allow, areAnyRolesAllowed, addRoleParents } from '@Services/AccessControlService/operations';

function getEventResourceId(eventId: number) {
  return `event-${eventId}`;
}

export const getEventViewRolePlain = (eventId: number) => `${getEventResourceId(eventId)}-view-role`;
export const getEventEditRolePlain = (eventId: number) => `${getEventResourceId(eventId)}-edit-role`;
export const getEventManageRolePlain = (eventId: number) => `${getEventResourceId(eventId)}-manage-role`;

export async function getEventViewRole(eventId: number, forceUpdate = false) {
  const resource = getEventResourceId(eventId);
  const role = getEventViewRolePlain(eventId);

  const isAllowed = await areAnyRolesAllowed(role, resource, 'view');
  if (!isAllowed || forceUpdate) {
    await allow(role, resource, 'view');
  }
  return role;
}

export async function getEventEditRole(eventId: number, forceUpdate = false) {
  const resource = getEventResourceId(eventId);
  const editRole = getEventEditRolePlain(eventId);

  const permissions = ['edit', 'makeCommit'];
  const isAllowed = await areAnyRolesAllowed(editRole, resource, permissions);
  if (!isAllowed || forceUpdate) {
    await allow(editRole, resource, permissions);
    const viewRole = await getEventViewRole(eventId);
    await addRoleParents(editRole, viewRole);
  }
  return editRole;
}

export async function getEventManageRole(eventId: number | number, forceUpdate = false) {
  const resource = getEventResourceId(eventId);
  const manageRole = getEventManageRolePlain(eventId);

  const permissions = ['addViewer', 'removeViewer', 'addEditor', 'removeEditor'];
  const isAllowed = await areAnyRolesAllowed(manageRole, resource, permissions);
  if (!isAllowed || forceUpdate) {
    await allow(manageRole, resource, permissions);
    const editRole = await getEventEditRole(eventId);
    await addRoleParents(manageRole, editRole);
  }
  return manageRole;
}

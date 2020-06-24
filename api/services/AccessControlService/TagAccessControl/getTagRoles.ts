import { allow, areAnyRolesAllowed, addRoleParents } from '@Services/AccessControlService/operations';

export const getTagResourceId = (tagId: number) => `tag-${tagId}`;

export const getTagViewRolePlain = (tagId: number) => `${getTagResourceId(tagId)}-view-role`;
export const getTagManageRolePlain = (tagId: number) => `${getTagResourceId(tagId)}-manage-role`;

export async function getTagViewRole(tagId: number, forceUpdate = false) {
  const resource = getTagResourceId(tagId);
  const role = getTagViewRolePlain(tagId);

  const isAllowed = await areAnyRolesAllowed(role, resource, 'view');
  if (!isAllowed || forceUpdate) {
    await allow(role, resource, 'view');
  }
  return role;
}

export async function getTagManageRole(tagId: number, forceUpdate = false) {
  const resource = getTagResourceId(tagId);
  const manageRole = getTagManageRolePlain(tagId);

  const permissions = ['addViewer', 'removeViewer', 'addEditor', 'removeEditor'];
  const isAllowed = await areAnyRolesAllowed(manageRole, resource, permissions);
  if (!isAllowed || forceUpdate) {
    await allow(manageRole, resource, permissions);
    const viewRole = await getTagViewRole(tagId);
    await addRoleParents(manageRole, viewRole);
  }
  return manageRole;
}

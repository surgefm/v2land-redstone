import { allow, areAnyRolesAllowed } from '@Services/AccessControlService/operations';

function getNewsResourceId(newsId: number) {
  return `news-${newsId}`;
}

export const getNewsEditRolePlain = (newsId: number) => `${getNewsResourceId(newsId)}-edit-role`;

export async function getNewsEditRole(newsId: number, forceUpdate = false) {
  const resource = getNewsResourceId(newsId);
  const editRole = getNewsEditRolePlain(newsId);

  const permissions = ['edit'];
  const isAllowed = await areAnyRolesAllowed(editRole, resource, permissions);
  if (!isAllowed || forceUpdate) {
    await allow(editRole, resource, permissions);
  }
  return editRole;
}

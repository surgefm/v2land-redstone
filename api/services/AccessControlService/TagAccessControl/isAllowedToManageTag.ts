import { isAllowed } from '@Services/AccessControlService/operations';
import { isClientManager } from '@Services/AccessControlService/RoleAccessControl';
import { getTagResourceId } from './getTagRoles';

export default async function isAllowedToManageTag(clientId: number, tagId: number) {
  return await isAllowed(clientId, getTagResourceId(tagId), 'addViewer') ||
    await isClientManager(clientId);
}

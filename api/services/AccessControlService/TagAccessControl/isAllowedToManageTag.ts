import { isAllowed } from '@Services/AccessControlService/operations';
import { getTagResourceId } from './getTagRoles';

export default async function isAllowedToManageTag(clientId: number, tagId: number) {
  return isAllowed(clientId, getTagResourceId(tagId), 'addViewer');
}

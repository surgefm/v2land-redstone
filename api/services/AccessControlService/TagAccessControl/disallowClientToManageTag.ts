import * as RecordService from '@Services/RecordService';
import { removeUserRoles } from '@Services/AccessControlService/operations';
import { getTagManageRolePlain } from './getTagRoles';

export default async function disallowClientToManageTag(clientId: number, tagId: number, by?: number) {
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'disallowClientToManageTag',
      target: clientId,
      subtarget: tagId,
      owner: by,
    });
  }
  return removeUserRoles(clientId, getTagManageRolePlain(tagId));
}

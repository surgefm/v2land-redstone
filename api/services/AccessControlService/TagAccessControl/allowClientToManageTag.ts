import * as RecordService from '@Services/RecordService';
import { addUserRoles } from '@Services/AccessControlService/operations';
import { getTagManageRole } from './getTagRoles';

export default async function allowClientToManageTag(clientId: number, tagId: number, by?: number) {
  if (by) {
    await RecordService.update({
      model: 'Client',
      action: 'allowClientToManageTag',
      target: clientId,
      subtarget: tagId,
      owner: by,
    });
  }
  return addUserRoles(clientId, await getTagManageRole(tagId));
}

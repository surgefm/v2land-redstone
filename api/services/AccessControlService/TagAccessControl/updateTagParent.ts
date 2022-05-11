import { Tag } from '@Models';
import { addRoleParents, removeRoleParents } from '@Services/AccessControlService/operations';
import { getTagManageRole } from './getTagRoles';

export const updateTagParent = async (tag: Tag, parent?: Tag) => {
  const tagRole = await getTagManageRole(tag.id);
  if (tag.parentId) {
    const existingParentRole = await getTagManageRole(tag.parentId);
    await removeRoleParents(tagRole, existingParentRole);
  }
  if (parent) {
    const newParentRole = await getTagManageRole(parent.id);
    await addRoleParents(tagRole, newParentRole);
  }
};

export default updateTagParent;

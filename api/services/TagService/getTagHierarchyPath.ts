import { Tag, Sequelize } from '@Models';

export const getTagHierarchyPath = async ({ tag, parentId = tag.parentId, transaction }: {
  tag: Tag;
  parentId?: number;
  transaction?: Sequelize.Transaction;
}) => {
  let hierarchyPath = [tag.id];
  if (parentId) {
    let parent = await Tag.findByPk(parentId, { transaction });
    while (parent.parentId) {
      hierarchyPath = [parent.id, ...hierarchyPath];
      parent = await Tag.findByPk(parent.parentId, { transaction });
    }
    hierarchyPath = [parent.id, ...hierarchyPath];
  }
  return hierarchyPath;
};

export default getTagHierarchyPath;

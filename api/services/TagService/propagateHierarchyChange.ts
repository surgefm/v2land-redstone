import { Tag, Sequelize } from '@Models';
import { getTagHierarchyPath } from './getTagHierarchyPath';

export const propagateHierarchyChange = async ({
  tag, transaction, hierarchyPath: path,
}: {
  tag: Tag;
  transaction?: Sequelize.Transaction;
  hierarchyPath?: number[];
}) => {
  const hierarchyPath = path ? [...path, tag.id] : await getTagHierarchyPath({
    tag,
    transaction,
  });
  await Tag.update(
    { hierarchyPath },
    {
      where: { id: tag.id },
      transaction,
    },
  );
  const children = await Tag.findAll({
    where: {
      parentId: tag.id,
    },
  });
  await Promise.all(children.map(t => propagateHierarchyChange({
    tag: t,
    transaction,
    hierarchyPath,
  })));
};

export default propagateHierarchyChange;

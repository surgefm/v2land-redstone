import { Tag, sequelize, Sequelize } from '@Models';

export const getAllChildTags = async ({
  tag: t, tagId, transaction,
}: {
  tag?: Tag;
  tagId?: number;
  transaction?: Sequelize.Transaction;
}) => {
  const tag = t || await Tag.findByPk(tagId, { transaction });
  if (!tag) return [];

  return sequelize.query<Tag>(`
    SELECT *
    FROM tag
    WHERE "hierarchyPath" @> ARRAY[${(tag.hierarchyPath || [tag.id]).join(',')}]
    AND id != ${tag.id}
  `, {
    type: Sequelize.QueryTypes.SELECT,
  });
};

export default getAllChildTags;

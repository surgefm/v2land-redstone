import { Tag } from '@Models';
import { updateStack } from '../AlgoliaService';

async function updateAlgoliaIndex({ tag, tagId }: {
  tag?: Tag;
  tagId?: number;
}) {
  if (!tag) {
    tag = await Tag.findByPk(tagId);
  }

  return updateStack(tag);
}

export default updateAlgoliaIndex;

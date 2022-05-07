import { Tag } from '@Models';
import { updateTag, deleteTag } from '../AlgoliaService';

async function updateAlgoliaIndex({ tag, tagId }: {
  tag?: Tag;
  tagId?: number;
}) {
  if (!tag) {
    tag = await Tag.findByPk(tagId);
  }

  if (tag.status !== 'visible') {
    return deleteTag(tag.id);
  }

  return updateTag(tag);
}

export default updateAlgoliaIndex;

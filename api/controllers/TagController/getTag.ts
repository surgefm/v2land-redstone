import { Tag, Event, News, Client } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService, TagService } from '@Services';

async function getTag(req: RedstoneRequest, res: RedstoneResponse) {
  const tag = await Tag.findByPk(req.params.tagId, {
    include: [{
      model: Event,
      as: 'events',
      where: { status: 'admitted' },
      through: { attributes: [] },
      include: [{
        model: News,
        as: 'latestAdmittedNews',
        required: false,
      }],
      required: false,
    }, {
      model: Client,
      as: 'curators',
      through: { attributes: [] },
      required: false,
      attributes: ClientService.sanitizedFields,
    }],
  });

  let tagVisible = !tag || tag.status !== 'hidden';
  if (!tagVisible && req.currentClient) {
    if (req.currentClient.isEditor) {
      tagVisible = true;
    }
  }

  if (!tag || !tagVisible) {
    return res.status(404).json({
      message: '无法找到该标签',
    });
  }

  const tagObj = tag.get({ plain: true }) as any;
  tagObj.parents = await Promise.all(
    (tag.hierarchyPath || [])
      .filter(t => t !== tag.id)
      .map(t => Tag.findByPk(t))
  );
  tagObj.children = await TagService.getAllChildTags({ tag });
  return res.status(200).json({ tag: tagObj });
}

export default getTag;

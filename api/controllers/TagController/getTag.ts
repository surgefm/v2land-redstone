import { Tag, Event, News } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';

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
    }],
  });

  let tagVisible = !tag || tag.status !== 'hidden';
  if (!tagVisible && req.currentClient) {
    if (['admin', 'manager'].includes(req.currentClient.role)) {
      tagVisible = true;
    }
  }

  if (!tag || !tagVisible) {
    return res.status(404).json({
      message: '无法找到该标签',
    });
  }
  return res.status(200).json({ tag });
}

export default getTag;

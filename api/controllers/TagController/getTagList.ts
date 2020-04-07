import { Tag } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function getTagList(req: RedstoneRequest, res: RedstoneResponse) {
  const tags = await Tag.findAll({
    where: { status: 'visible' },
    limit: 15,
    offset: 15 * (+req.query.page || req.body.page || 1) - 15,
  });

  res.status(200).json({ tags });
}

export default getTagList;

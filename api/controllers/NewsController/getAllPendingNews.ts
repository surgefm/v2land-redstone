import { News } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function getAllPendingNews (req: RedstoneRequest, res: RedstoneResponse) {
  const newsCollection = await News.findAll({
    where: {
      status: 'pending',
    },
  });

  return res.status(200).json({ newsCollection });
}

export default getAllPendingNews;

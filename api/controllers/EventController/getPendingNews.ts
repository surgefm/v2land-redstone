import { RedstoneRequest, RedstoneResponse } from '@Types';
import { News } from '@Models';
import { EventService } from '@Services';

async function getPendingNews (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name);

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const newsCollection = await News.findAll({
    where: {
      eventId: event.id,
      status: 'pending',
    },
  });

  return res.status(200).json({ newsCollection });
}

export default getPendingNews;

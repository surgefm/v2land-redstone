import { RedstoneRequest, RedstoneResponse, EventObj } from '@Types';
import { Event } from '@Models';
import { EventService } from '@Services';

async function getPendingNews(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  let event: EventObj | Event = await EventService.findEvent(name);

  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  event = await Event.findByPk(event.id);
  const newsCollection = await event.$get('news', {
    where: { status: 'pending' },
  });

  return res.status(200).json({ newsCollection });
}

export default getPendingNews;

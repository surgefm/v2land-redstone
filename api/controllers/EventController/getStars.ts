import { Star } from '@Models';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function getStars(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const stars = await Star.findAll({
    where: { eventId },
    order: [['createdAt', 'DESC']],
  });
  return res.status(200).json({ stars });
}

export default getStars;

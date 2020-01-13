import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Event } from '@Models';

async function getAllPendingEvents (req: RedstoneRequest, res: RedstoneResponse) {
  const eventCollection = await Event.findAll({
    where: { status: 'pending' },
    order: [['createdAt', 'ASC']],
  });
  res.status(200).json({ eventCollection });
}

export default getAllPendingEvents;

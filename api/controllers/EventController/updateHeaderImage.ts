import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function updateHeaderImage(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  const headerImage = await EventService.updateHeaderImage(eventId, req.body, req.session.clientId);

  res.status(201).json({
    message: req.method === 'PUT' ? '修改成功' : '添加成功',
    headerImage,
  });
}

export default updateHeaderImage;

import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService } from '@Services';

async function getEvent (req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.param('eventName');
  const event = await EventService.findEvent(name, {
    includes: req.query,
  });

  if (event) {
    event.contribution = await EventService.getContribution(event, true);
    res.status(200).json(event);
  } else {
    res.status(404).json({
      message: '未找到该事件',
    });
  }
}

export default getEvent;

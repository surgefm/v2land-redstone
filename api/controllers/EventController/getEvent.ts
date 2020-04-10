import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, CommitService } from '@Services';

async function getEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  if (!eventId) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const commit = await CommitService.getLatestCommit(eventId);

  if (commit) {
    return res.status(200).json({
      event: commit.data,
    });
  }

  // If there is no commit.
  const event = await EventService.findEvent(eventId, { plain: true });
  event.contribution = await EventService.getContribution(event, true);
  res.status(200).json(event);
}

export default getEvent;

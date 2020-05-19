import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, CommitService, AccessControlService } from '@Services';

async function getEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);
  if (!eventId) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const showLatest = req.query.latest === '1';
  const noAccess = () => res.status(401).json({
    message: '你无权查看事件最新编辑情况',
  });

  if (showLatest) {
    if (!req.session.clientId) return noAccess();
    const haveAccess = await AccessControlService.isAllowedToViewEvent(req.session.clientId, eventId);
    if (!haveAccess) return noAccess();
  } else {
    const commit = await CommitService.getLatestCommit(eventId);

    if (commit) {
      return res.status(200).json({
        event: commit.data,
      });
    }
  }

  // If there is no commit or client wants the latest version.
  const event = await EventService.findEvent(eventId, { plain: true });
  event.contribution = await EventService.getContribution(event, true);
  res.status(200).json(event);
}

export default getEvent;

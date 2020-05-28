import { RedstoneRequest, RedstoneResponse, EventObj } from '@Types';
import { EventService, CommitService, AccessControlService } from '@Services';

async function getEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const eventId = await EventService.getEventId(req.params);
  if (!eventId) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const showLatest = req.query.latest === '1';
  const noAccess = (event: EventObj) => {
    res.status(401).json({
      message: '你无权查看事件最新编辑情况',
      event,
    });
  };

  const roles = await AccessControlService.getEventClients(eventId);

  let deniedAccess = false;
  if (showLatest) {
    if (!req.session.clientId) deniedAccess = true;
    else {
      const haveAccess = await AccessControlService.isAllowedToViewEvent(req.session.clientId, eventId);
      if (!haveAccess) deniedAccess = true;
    }
  }

  const commit = await CommitService.getLatestCommit(eventId);

  if (commit && !showLatest) {
    commit.data.roles = roles;
    if (deniedAccess) return noAccess(commit.data);
    return res.status(200).json(commit.data);
  }

  // If there is no commit or client wants the latest version.
  const event = await EventService.findEvent(eventId, { plain: true, getNewsroomContent: true });
  event.contribution = await EventService.getContribution(event, true);
  event.roles = roles;
  if (deniedAccess) return noAccess(event);
  res.status(200).json(event);
}

export default getEvent;

import { RedstoneRequest, RedstoneResponse, EventObj } from '@Types';
import { Event } from '@Models';
import { EventService, CommitService, AccessControlService, StarService, RedisService } from '@Services';

async function getEvent(req: RedstoneRequest, res: RedstoneResponse) {
  const eventId = await EventService.getEventId(req.params);
  if (!eventId) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }

  const e = await Event.findByPk(eventId);

  const showLatest = req.query.latest === '1';
  const noAccess = (event: EventObj) => {
    res.status(401).json({
      message: '你无权查看事件最新编辑情况',
      event,
    });
  };

  const roles = await AccessControlService.getEventClients(eventId);
  const starCount = await StarService.countStars(eventId);
  const subscriptionCount = await RedisService.hlen(RedisService.getSubscriptionCacheKey(eventId));
  const curations = await EventService.getCurations(eventId);

  let deniedAccess = false;
  if (showLatest) {
    if (!req.session.clientId) deniedAccess = true;
    else {
      const haveAccess = e.status === 'admitted' ||
        await AccessControlService.isAllowedToViewEvent(req.session.clientId, eventId);
      if (!haveAccess) deniedAccess = true;
    }
  }

  const commit = await CommitService.getLatestCommit(eventId);
  const commitData = commit ? {
    ...commit.data,
    roles,
    starCount,
    subscriptionCount,
    needContributor: e.needContributor,
    curations,
  } : null;

  if (commit && !showLatest || (showLatest && deniedAccess)) {
    commit.data.roles = roles;
    if (deniedAccess) return noAccess(commitData);
    return res.status(200).json(commitData);
  }

  if (deniedAccess) return noAccess(commit ? commitData : null);

  // If there is no commit or client wants the latest version.
  const event = await EventService.findEvent(eventId, { plain: true, getNewsroomContent: true });
  event.contribution = await EventService.getContribution(event, true);
  event.roles = roles;
  event.starCount = starCount;
  event.subscriptionCount = subscriptionCount;
  event.curations = curations;
  res.status(200).json(event);
}

export default getEvent;

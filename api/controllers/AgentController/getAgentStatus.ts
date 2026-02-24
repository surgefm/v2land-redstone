import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, AgentService } from '@Services';

async function getAgentStatus(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);

  if (!eventId) {
    return res.status(404).json({ message: '未找到该事件' });
  }

  const running = await AgentService.AgentLock.isLocked(eventId);

  res.status(200).json({
    eventId,
    running,
  });
}

export default getAgentStatus;

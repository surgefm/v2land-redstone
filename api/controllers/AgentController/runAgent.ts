import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, AgentService } from '@Services';

async function runAgent(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);

  if (!eventId) {
    return res.status(404).json({ message: '未找到该事件' });
  }

  const { message } = req.body || {};

  const locked = await AgentService.AgentLock.isLocked(eventId);
  if (locked) {
    // Agent already running — push message to inbox if provided
    if (message) {
      await AgentService.AgentLock.pushToInbox(eventId, message);
    }
    return res.status(409).json({ message: 'Bot 已在运行中' });
  }

  // Fire and forget — agent runs in background
  AgentService.run(eventId, message).catch((err) => {
    console.error(`[AgentController] Agent run error for event ${eventId}:`, err);
  });

  res.status(202).json({
    message: 'Agent 已启动',
    eventId,
  });
}

export default runAgent;

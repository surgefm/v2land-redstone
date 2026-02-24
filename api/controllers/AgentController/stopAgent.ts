import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, AgentService, ChatService } from '@Services';

async function stopAgent(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);

  if (!eventId) {
    return res.status(404).json({ message: '未找到该事件' });
  }

  try {
    const running = await AgentService.AgentLock.isLocked(eventId);
    if (!running) {
      return res.status(404).json({ message: '当前没有运行中的 Bot' });
    }

    // Set stop flag — the agentic loop will check this between iterations
    await AgentService.AgentLock.requestStop(eventId);

    // Send a chat message notifying that stop was requested
    const botClient = await AgentService.getOrCreateBotClient();
    await ChatService.sendMessage(
      'newsroom',
      botClient.id,
      'Bot 已收到停止请求，将在当前操作完成后停止。',
      eventId,
    );

    res.status(200).json({
      message: 'Bot 停止请求已发送',
      eventId,
    });
  } catch (err) {
    (req.log || console).error(err);
    res.status(500).json({ message: '停止 Bot 时发生错误' });
  }
}

export default stopAgent;

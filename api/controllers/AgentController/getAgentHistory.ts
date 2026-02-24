import { Op } from 'sequelize';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, AgentService, AccessControlService } from '@Services';
import { AgentStatus } from '@Models';

async function getAgentHistory(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const eventId = await EventService.getEventId(name);

  if (!eventId) {
    return res.status(404).json({ message: '未找到该事件' });
  }

  const clientId = req.session.clientId;
  const hasAccess = await AccessControlService.isAllowedToViewNewsroomChat(clientId, eventId);
  if (!hasAccess) {
    return res.status(401).json({ message: '你没有权限浏览该编辑室' });
  }

  const type = (req.query.type as string) || 'status';
  const where: any = { eventId, type };

  if (req.query.before) {
    where.createdAt = { [Op.lte]: req.query.before };
  }

  if (req.query.runId) {
    where.runId = req.query.runId;
  }

  const statuses = await AgentStatus.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  const running = await AgentService.AgentLock.isLocked(eventId);

  res.status(200).json({ statuses, running });
}

export default getAgentHistory;

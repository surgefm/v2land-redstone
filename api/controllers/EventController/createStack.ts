import { RedstoneRequest, RedstoneResponse } from '@Types';
import { EventService, StackService } from '@Services';
import { hasRole } from '@Services/AccessControlService/operations';
import { getEventEditRolePlain } from '@Services/AccessControlService';

async function createStack(req: RedstoneRequest, res: RedstoneResponse) {
  const name = req.params.eventName;
  const event = await EventService.findEvent(name, { eventOnly: true });
  if (!event) {
    return res.status(404).json({
      message: '未找到该事件',
    });
  }
  const eventId = event.id;
  const editRole = getEventEditRolePlain(eventId);
  const haveAccess = hasRole(req.session.clientId, editRole);
  if (!haveAccess) {
    return res.status(403).json({
      message: `提交失败，用户没有编辑事件「${event.name}」的权限`,
    });
  }

  const data = req.body;

  const stack = await StackService.createStack(name, data, req.session.clientId);
  return res.status(201).json({
    message: '提交成功，该进展在社区管理员审核通过后将很快开放',
    stack,
  });
}

export default createStack;

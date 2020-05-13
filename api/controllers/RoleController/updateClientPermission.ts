import { AccessControlService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { sequelize, Record } from '@Models';

export default async function updateClientPermission(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body && !req.body.clientId && !req.body.resource && !req.body.action) {
    return res.status(400).json({
      message: '缺少参数 clientId 或 resource 或 action',
    });
  }

  const data = {
    clientId: parseInt(req.body.clientId),
    action: req.body.action,
    // should be like event-123
    resource: req.body.resource,
  };

  if (isNaN(data.clientId)) {
    return res.status(400).json({
      message: '参数 clientId 不是数字',
    });
  }
  await sequelize.transaction(async transaction => {
    const roleName = `${data.resource}-${data.action}-role`;
    if (req.method === 'DELETE') {
      await AccessControlService.removeUserRoles(data.clientId, roleName, (err) => {
        if (err) {
          return res.status(404).json({
            message: `用户 ${data.clientId}没有 "${data.action}" ${data.resource} 的权限，删除失败`,
          });
        }
      });
    } else if (req.method === 'POST') {
      await AccessControlService.addUserRoles(data.clientId, roleName, (err) => {
        if (err) {
          return res.status(403).json({
            message: `用户 ${data.clientId}已经拥有 "${data.action}" ${data.resource} 的权限`,
          });
        }
      });
    }
    const opWord = req.method === 'DELETE' ? 'delete' : 'update';
    await Record.create({
      operation: opWord,
      model: 'acl',
      data: { role: roleName, action: data.action, resource: data.resource },
      client: req.session.clientId,
      target: data.clientId,
      action: 'updateClientPermission',
    }, { transaction });
    let message;
    if (req.method === 'POST') {
      message = `用户 ${data.clientId}现在拥有 "${data.action}" ${data.resource} 的权限，更新成功`;
    } else if (req.method === 'DELETE') {
      message = `用户 ${data.clientId}现在失去了 "${data.action}" ${data.resource} 的权限，删除成功`;
    }
    res.status(200).json({
      message: message,
    });
  });
}

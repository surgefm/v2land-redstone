import { AccessControlService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { sequelize, Record } from '@Models';

export default async function updateClientRole(req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body && !req.body.clientId && !req.body.roleName) {
    return res.status(400).json({
      message: '缺少参数 clientId 或 roleName',
    });
  }

  const data = {
    clientId: parseInt(req.body.clientId),
    // should be like event-123-edit-role
    roleName: req.body.roleName,
  };

  if (isNaN(data.clientId)) {
    return res.status(400).json({
      message: '参数 clientId 不是数字',
    });
  }
  await sequelize.transaction(async transaction => {
    if (req.method === 'DELETE') {
      await AccessControlService.removeUserRoles(data.clientId, data.roleName, (err) => {
        if (err) {
          return res.status(404).json({
            message: `客户端 ${data.clientId} 的角色 ${data.roleName} 不存在，删除失败`,
          });
        }
      });
    } else if (req.method === 'POST') {
      await AccessControlService.addUserRoles(data.clientId, data.roleName, (err) => {
        if (err) {
          return res.status(403).json({
            message: `客户端 ${data.clientId} 的角色 ${data.roleName} 已经存在`,
          });
        }
      });
    }
    const opWord = req.method === 'DELETE' ? 'delete' : 'update';
    await Record.create({
      operation: opWord,
      model: 'acl',
      data: { role: data.roleName },
      client: req.session.clientId,
      target: data.clientId,
      action: 'updateClientRole',
    }, { transaction });
    let message;
    if (req.method === 'POST') {
      message = `客户端 ${data.clientId} 的角色 ${data.roleName} 更新成功`;
    } else if (req.method === 'DELETE') {
      message = `客户端 ${data.clientId} 的角色 ${data.roleName} 删除成功`;
    }
    res.status(200).json({
      message: message,
    });
  });
}

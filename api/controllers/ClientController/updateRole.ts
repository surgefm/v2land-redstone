import { RedstoneRequest, RedstoneResponse } from '@Types';
import { ClientService } from '@Services';
import { Record, sequelize } from '@Models';

async function updateRole (req: RedstoneRequest, res: RedstoneResponse) {
  // this API is a replacement of role()
  // is only used by an admin to change a client's role
  // only accessible by PUT method
  // to look up for a client's role, please use getClientDetail
  // accept parameter: { id: number, newRole: string, }
  const data = req.body;

  if (typeof data.id !== 'number') {
    data.id = parseInt(data.id);
  }

  if (data.id === req.session.clientId) {
    return res.status(400).json({
      message: '您不可以修改自己的用户组',
    });
  }

  await sequelize.transaction(async transaction => {
    const targetClient = await ClientService.findClient(data.id, {
      withAuths: false,
      withSubscriptions: false,
      transaction,
    });

    if (!targetClient) {
      return res.status(404).json({
        message: '未找到目标用户',
      });
    }

    const targetCurrentRole = targetClient.role;
    const targetNewRole = data.newRole;
    const roleOptions = ['contributor', 'manager'];
    if (targetCurrentRole === 'admin' ||
      roleOptions.indexOf(targetCurrentRole) < 0 ||
      roleOptions.indexOf(targetNewRole) < 0) {
      return res.status(400).json({
        message: '您不可以这样修改此用户组',
      });
    }

    if (targetCurrentRole === targetNewRole) {
      return res.status(200).json({
        message: '该用户已位于目标用户组中',
      });
    }

    targetClient.role = targetNewRole;

    await targetClient.save({ transaction });

    await Record.create({
      operation: 'update',
      model: 'Client',
      data: { role: targetNewRole },
      client: req.session.clientId,
      target: req.session.clientId,
      action: 'updateClientRole',
    }, { transaction });

    res.status(201).json({
      message: '成功更新用户组',
    });

    ClientService.updateElasticsearchIndex({ clientId: targetClient.id });
  });
}

export default updateRole;

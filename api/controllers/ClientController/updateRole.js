const SeqModels = require('../../../seqModels');

async function updateRole (req, res) {
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

  const targetClient = await SeqModels.Client.findById(data.id);
  if (!targetClient) {
    return res.status(404).json({
      message: '未找到目标用户',
    });
  }

  try {
    await sequelize.transaction(async transaction => {
      const targetClient = await SeqModels.Client.findOne({
        where: { id: data.id },
        transaction,
      });
      const targetCurrentRole = targetClient.role;
      const targetNewRole = data.newRole;
      const roleOptions = ['contributor', 'manager'];
      if (targetCurrentRole === 'admin' ||
        roleOptions.indexOf(targetCurrentRole) < 0 ||
        roleOptions.indexOf(targetNewRole) < 0) {
        return res.send(400, {
          message: '您不可以这样修改此用户组',
        });
      }

      if (targetCurrentRole === targetNewRole) {
        res.send(200, {
          message: '该用户已位于目标用户组中',
        });
      }

      targetClient.role = targetNewRole;

      await targetClient.save({ transaction });

      await SeqModels.Record.create({
        operation: 'update',
        model: 'Client',
        data: { role: targetNewRole },
        client: req.session.clientId,
        target: req.session.clientId,
        action: 'updateClientRole',
      }, { transaction });

      res.send(201, {
        message: '成功更新用户组',
      });

      ClientService.updateElasticsearchIndex({ clientId: targetClient.id });
    });
  } catch (err) {
    return res.serverError(err);
  }
}

module.exports = updateRole;

import { RedstoneRequest, RedstoneResponse, sequelize } from '@Types';
import { Record } from '@Models';
import { ClientService } from '@Services';

async function updateSettings (req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body || !req.body.settings) {
    return res.status(400).json({
      message: '缺少修改信息',
    });
  }

  const { settings } = req.body;
  const name = req.param('clientName');
  await ClientService.validateSettings(settings);
  await sequelize.transaction(async transaction => {
    const client = await ClientService.findClient(name, {
      withAuths: false,
      withSubscriptions: false,
      transaction,
    });

    if (!client) {
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    client.settings = {
      ...client.settings,
      ...settings,
    };

    await client.save({ transaction });
    await Record.create({
      operation: 'update',
      model: 'Client',
      data: { settings },
      client: req.session.clientId,
      target: req.session.clientId,
      action: 'updateClientSettings',
    }, { transaction });

    res.status(201).json({
      message: '成功更新用户设置',
    });
  });
}

export default updateSettings;

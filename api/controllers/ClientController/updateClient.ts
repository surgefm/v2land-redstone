import { RedstoneRequest, RedstoneResponse } from '@Types';
import { sequelize } from '@Models';
import { ClientService, RecordService } from '@Services';

async function updateClient (req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.body) {
    return res.status(400).json({
      message: '缺少修改信息',
    });
  }

  const name = req.params.clientName;
  let client = await ClientService.findClient(name, {
    withAuths: false,
    withSubscriptions: false,
  });
  if (!client) {
    return res.status(404).json({
      message: '未找到该用户',
    });
  }
  // if the client is not Admin, he is not allowed to update other client
  if (!req.currentClient.isAdmin && req.currentClient.username !== client.username) {
    return res.status(403).json({
      message: '您没有权限进行该操作',
    });
  }

  const changes: any = {};
  for (const i of ['username']) {
    if (req.body[i] && req.body[i] !== (client as any)[i]) {
      changes[i] = req.body[i];
    }
  }

  await sequelize.transaction(async transaction => {
    const origClient = client.get({ plain: true });
    await client.update(changes, { transaction });
    await RecordService.update({
      data: changes,
      owner: req.session.clientId,
      model: 'Client',
      before: origClient,
      target: client.id,
      action: 'updateClientDetail',
    }, { transaction });
  });

  client = req.currentClient = await ClientService.findClient(client.id);

  res.status(201).json({
    message: '修改成功',
    client,
  });

  ClientService.updateElasticsearchIndex({ clientId: client.id });
}

export default updateClient;

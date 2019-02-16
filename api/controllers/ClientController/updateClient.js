async function updateClient (req, res) {
  if (!req.body) {
    return res.status(400).json({
      message: '缺少修改信息',
    });
  }

  const name = req.param('clientName');
  let client = await ClientService.findClient(name);
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

  changes = {};
  for (const i of ['username']) {
    if (req.body[i] && req.body[i] !== client[i]) {
      changes[i] = req.body[i];
    }
  }
  try {
    await sequelize.transaction(async transaction => {
      const origClient = client.get({ plain: true });
      await client.update(changes, { transaction });
      await RecordService.update({
        data: changes,
        owner: req.session.clientId,
        model: 'Client',
        before: origClient,
        action: 'updateClientDetail',
      }, { transaction });
    });

    client = req.currentClient = await ClientService.findClient(client.id);

    res.status(201).json({
      message: '修改成功',
      client,
    });
  } catch (err) {
    return res.serverError(err);
  }

  ClientService.updateElasticsearchIndex({ clientId: client.id });
}

module.exports = updateClient;

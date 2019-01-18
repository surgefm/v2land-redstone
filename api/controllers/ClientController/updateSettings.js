const SeqModels = require('../../../seqModels');

async function updateSettings (req, res) {
  if (!req.body || !req.body.settings) {
    return res.status(400).json({
      message: '缺少修改信息',
    });
  }

  const { settings } = req.body;
  const name = req.param('clientName');
  try {
    await ClientService.validateSettings(settings);
    await sequelize.transaction(async transaction => {
      const client = await SeqModels.Client.findOne({
        where: { id: name },
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
      await SeqModels.Record.create({
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
  } catch (err) {
    return res.serverError(err);
  }
}

module.exports = updateSettings;

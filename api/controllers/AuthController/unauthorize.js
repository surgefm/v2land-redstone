const SeqModels = require('../../../seqModels');

async function unauthorize (req, res) {
  if (!req.param('authId')) {
    return res.status(400).json({
      message: '缺少参数：authId',
    });
  }

  const auth = await SeqModels.Auth.findById(req.param('authId'));
  if (!auth) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  if (auth.owner !== req.session.clientId) {
    return res.status(403).json({
      message: '你无权进行该解绑',
    });
  }

  try {
    await sequelize.transaction(async transaction => {
      await SeqModels.Auth.destroy(
        { where: { id: auth.id } },
        { transaction });

      await RecordService.destroy({
        model: 'auth',
        target: auth.id,
        owner: req.session.clientId,
        action: 'unauthorizeThirdPartyAccount',
      }, { transaction });
    });
  } catch (err) {
    return res.serverError(err);
  }

  res.status(201).json({
    message: '成功解除绑定',
  });
}

module.exports = unauthorize;

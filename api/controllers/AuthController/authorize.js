const SeqModels = require('../../../seqModels');

async function authorize (req, res) {
  if (!(req.body && req.body.authId)) {
    return res.status(400).json({
      message: '缺少参数：authId',
    });
  }

  const auth = await SeqModels.Auth.findById(req.body.authId);
  if (!auth || !auth.profile) {
    return res.status(404).json({
      message: '未找到该绑定信息',
    });
  }

  const { expireTime, owner } = auth.profile;

  if (!owner || owner !== req.sessionID) {
    return res.status(403).json({
      message: '你无权进行该绑定',
    });
  } else if (!expireTime || Date.now() > expireTime) {
    return res.status(403).json({
      message: '已过绑定时效，请重新发起绑定',
    });
  }

  try {
    await sequelize.transaction(async transaction => {
      await auth.update({
        owner: req.body.clientId || req.session.clientId,
      }, { transaction });

      const data = {
        id: auth.id,
        site: auth.site,
        profileId: auth.profileId,
        owner: auth.owner,
      };

      await RecordService.update({
        model: 'Auth',
        target: data.id,
        data,
        owner: req.session.clientId,
        action: 'authorizeThirdPartyAccount',
      }, { transaction });

      res.status(201).json({
        message: '绑定成功',
      });
    });
  } catch (err) {
    return res.serverError(err);
  }
}

module.exports = authorize;

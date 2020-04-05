import { Auth, sequelize } from '@Models';
import { RecordService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function unauthorize (req: RedstoneRequest, res: RedstoneResponse) {
  if (!req.param('authId')) {
    return res.status(400).json({
      message: '缺少参数：authId',
    });
  }

  const auth = await Auth.findByPk(req.param('authId'));
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

  await sequelize.transaction(async transaction => {
    await Auth.destroy({
      where: { id: auth.id },
      transaction,
    });

    await RecordService.destroy({
      model: 'auth',
      target: auth.id,
      owner: req.session.clientId,
      action: 'unauthorizeThirdPartyAccount',
    }, { transaction });
  });

  res.status(201).json({
    message: '成功解除绑定',
  });
}

export default unauthorize;

import * as bcrypt from 'bcrypt';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Client, sequelize } from '@Models';
import { ClientService, RecordService } from '~/api/services';

async function changePassword(req: RedstoneRequest, res: RedstoneResponse) {
  const data = req.body;
  let salt;
  let hash;

  if (
    typeof data.id === 'undefined' ||
    typeof data.password === 'undefined'
  ) {
    return res.status(404).json({
      message: '参数错误',
    });
  }

  ClientService.validatePassword(data.password);

  const { clientId } = req.session;
  const targetId = data.id;

  const selfClient = req.currentClient;

  await sequelize.transaction(async transaction => {
    const targetClient = await Client.findOne({
      where: {
        id: targetId,
      },
      transaction,
    });

    if (typeof targetClient === 'undefined') {
      return res.status(500).json({
        message: '找不到目标用户',
      });
    }

    if (targetId !== clientId && selfClient.isAdmin) {
      return res.status(500).json({
        message: '您没有修改此用户密码的权限',
      });
    }

    try {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(data.password, salt);
    } catch (err) {
      req.log.error(err);
      return res.status(500).json({
        message: '服务器发生未知错误，请联系开发者',
      });
    }

    targetClient.password = hash;
    await targetClient.save({ transaction });

    await RecordService.update({
      model: 'Client',
      action: 'updateClientPassword',
      client: targetId,
      target: targetId,
    }, { transaction });

    res.status(201).send({
      message: '更新密码成功',
    });
  });
}

export default changePassword;

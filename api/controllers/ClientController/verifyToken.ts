import { RedstoneRequest, RedstoneResponse } from '@Types';
import { Record, Client } from '@Models';
import { ClientService } from '@Services';

async function verifyToken (req: RedstoneRequest, res: RedstoneResponse) {
  let token;
  let id;
  if (req.body && req.body.token && req.body.id) {
    token = req.body.token;
    id = req.body.id;
  } else if (req.query && req.query.token && req.query.id) {
    token = req.query.token;
    id = req.query.id;
  }

  if (!(token && id)) {
    return res.status(400).json({
      message: '缺少参数：token 或 id',
    });
  }

  const record = await Record.findOne({
    where: {
      action: 'createClientVerificationToken',
      target: +id,
    },
    order: [['createdAt', 'DESC']],
  });

  if (!record) {
    return res.status(404).json({
      message: '未找到该 token',
    });
  }

  if (record.data.verificationToken !== token) {
    return res.status(404).json({
      message: '该 token 无效',
    });
  }

  if (new Date(record.data.expire).getTime() < Date.now()) {
    return res.status(404).json({
      message: '该 token 已失效',
    });
  }

  const client = await Client.findByPk(record.data.clientId);

  if (!client) {
    return res.status(404).json({
      message: '该 token 无效',
    });
  }

  client.emailVerified = true;
  await client.save();

  res.status(201).json({
    message: '账户验证成功',
  });

  ClientService.updateElasticsearchIndex({ client });
}

export default verifyToken;

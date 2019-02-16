const SeqModels = require('../../../seqModels');

async function verifyToken (req, res) {
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

  let record = await SeqModels.Record.findOne({
    where: {
      action: 'createClientVerificationToken',
      data: {
        verificationToken: token,
        clientId: id,
      },
    },
  });

  if (!record || !record[0]) {
    return res.status(404).json({
      message: '未找到该 token',
    });
  }

  record = record[0];

  if (new Date(record.data.expire).getTime() < Date.now()) {
    return res.status(404).json({
      message: '该 token 已失效',
    });
  }

  const client = await SeqModels.Client.findById(record.data.clientId);

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

module.exports = verifyToken;

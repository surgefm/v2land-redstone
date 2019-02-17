const bcrypt = require('bcryptjs');
const SeqModels = require('../../../seqModels');

async function register (req, res) {
  const data = req.body;
  let salt;
  let hash;

  try {
    await sequelize.transaction(async transaction => {
      let client = await ClientService.findClient(data.username, {
        withAuths: false,
        withSubscriptions: false,
      });

      if (client) {
        const message = client.username === data.username
          ? '该用户名已被占用'
          : '该邮箱已被占用';
        return res.status(406).json({ message });
      }

      try {
        salt = await bcrypt.genSalt(10);
      } catch (err) {
        return res.status(500).json({
          message: 'Error occurs when generating salt',
        });
      }

      try {
        hash = await bcrypt.hash(data.password, salt);
      } catch (err) {
        return res.status(500).json({
          message: 'Error occurs when generating hash',
        });
      }

      client = await SeqModels.Client.create({
        username: data.username,
        password: hash,
        email: data.email,
        role: 'contributor',
      }, {
        raw: true,
        transaction,
      });

      const verificationToken = ClientService.tokenGenerator();

      await SeqModels.Record.create({
        model: 'Client',
        operation: 'create',
        data: client,
        target: client.id,
        action: 'createClient',
        client: req.session.clientId,
      }, { transaction });

      await SeqModels.Record.create({
        model: 'Miscellaneous',
        operation: 'create',
        data: {
          clientId: client.id,
          verificationToken,
          expire: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        },
        target: client.id,
        action: 'createClientVerificationToken',
        client: req.session.clientId,
      }, { transaction });

      req.session.clientId = client.id;
      res.status(201).json({
        message: '注册成功，请在三天内至邮箱查收验证邮件',
        client,
      });

      EmailService.register(client, verificationToken);
    });
  } catch (err) {
    console.log(err);
    return res.serverError(err);
  }

  ClientService.updateElasticsearchIndex({ clientId: client.id });
}

module.exports = register;

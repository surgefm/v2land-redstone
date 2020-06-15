import * as bcrypt from 'bcrypt';
import { Client, Record, sequelize } from '@Models';
import { ClientService, EmailService, AccessControlService, RedisService } from '@Services';
import { RedstoneRequest, RedstoneResponse } from '@Types';

async function register(req: RedstoneRequest, res: RedstoneResponse) {
  const data = req.body;
  let salt;
  let hash;

  if (!data.username || !data.email || !data.password || !data.nickname) {
    return res.status(400).json({
      message: '缺少参数：username，email，nickname 或 password。',
    });
  }

  ClientService.validatePassword(data.password);

  await sequelize.transaction(async transaction => {
    let client = await ClientService.findClient(data.username, {
      withAuths: false,
      withSubscriptions: false,
    });

    client = client || await ClientService.findClient(data.email, {
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
      hash = await bcrypt.hash(data.password, salt);
    } catch (err) {
      return res.status(500).json({
        message: 'Error occurs when generating hash',
      });
    }

    client = await Client.create({
      username: data.username,
      nickname: data.nickname,
      password: hash,
      email: data.email,
    }, {
      raw: true,
      transaction,
    });

    await AccessControlService.allowClientToEditRole(client.id, client.id);
    await AccessControlService.addUserRoles(client.id, AccessControlService.roles.contributors);
    const verificationToken = ClientService.tokenGenerator();

    await Record.create({
      model: 'Client',
      operation: 'create',
      data: client,
      target: client.id,
      action: 'createClient',
      client: req.session.clientId,
    }, { transaction });

    await Record.create({
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

    await RedisService.set(RedisService.getClientIdKey(client.username), client.id);

    req.session.clientId = client.id;
    const clientObj: any = client.get({ plain: true });
    delete clientObj.password;
    res.status(201).json({
      message: '注册成功，请在三天内至邮箱查收验证邮件',
      client: clientObj,
    });

    EmailService.register(client, verificationToken);
    ClientService.updateElasticsearchIndex({ clientId: client.id });
  });
}

export default register;

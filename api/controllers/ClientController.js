/**
 * ClientController
 *
 * @description :: Server-side logic for managing clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const crypto = require('crypto');

/**
 * token generator
 */
function tokenGenerator() {
  const token = uuidv4();
  return crypto
    .createHash('sha256')
    .update(token, 'utf8')
    .digest('hex');
}

module.exports = {

  login: async (req, res) => {
    const data = req.body;

    const client = await Client.findOne({
      username: data.username,
    });

    if (!client) {
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    const verified = await bcrypt.compare(data.password, client.password);

    if (!verified) {
      return res.status(401).json({
        message: '错误的用户名、邮箱或密码',
      });
    }

    req.session.clientId = client.id;

    res.status(200).json({
      message: '登录成功',
      client: await ClientService.findClient(client.id),
    });
  },

  logout: (req, res) => {
    delete req.session.clientId;

    res.send(200, {
      message: '成功退出登录',
    });
  },

  register: async (req, res) => {
    const data = req.body;
    let salt;
    let hash;

    let client = await Client.findOne({
      or: [
        { username: data.username },
        { email: data.email },
      ],
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

    try {
      client = await SQLService.create({
        model: 'client',
        operation: 'create',
        data: {
          username: data.username,
          password: hash,
          email: data.email,
          role: 'contributor',
        },
        action: 'createClient',
        client: req.session.clientId,
        verificationToken: tokenGenerator(),
      });

      req.session.clientId = client.id;
      res.status(201).json({
        message: '注册成功',
        client: await ClientService.findClient(client.id),
      });

      EmailService.register(client);
    } catch (err) {
      return res.serverError(err);
    }
  },

  changePassword: async (req, res) => {
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

    const { clientId } = req.session;
    const targetId = data.id;

    const selfClient = req.currentClient;

    const targetClient = await Client.findOne({
      id: targetId,
    });

    if (typeof targetClient === 'undefined') {
      return res.status(500).json({
        message: '找不到目标用户',
      });
    }

    if (targetId !== clientId && selfClient.role !== 'admin') {
      return res.status(500).json({
        message: '您没有修改此用户密码的权限',
      });
    }

    try {
      salt = await bcrypt.genSalt(10);
    } catch (err) {
      sails.log.error(err);
      return res.status(500).json({
        message: '服务器发生未知错误，请联系开发者',
      });
    }

    try {
      hash = await bcrypt.hash(data.password, salt);
    } catch (err) {
      sails.log.error(err);
      return res.status(500).json({
        message: '服务器发生未知错误，请联系开发者',
      });
    }

    try {
      await SQLService.update({
        where: { id: targetId },
        model: 'client',
        data: {
          password: hash,
        },
        client: targetId,
        action: 'updateClientPassword',
      });

      res.send(201, {
        message: '更新密码成功',
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  updateRole: async (req, res) => {
    // this API is a replacement of role()
    // is only used by an admin to change a client's role
    // only accessible by PUT method
    // to look up for a client's role, please use getClientDetail
    // accept parameter: { id: number, newRole: string, }
    const data = req.body;

    if (typeof data.id !== 'number') {
      data.id = parseInt(data.id);
    }

    if (data.id === req.session.clientId) {
      return res.status(400).json({
        message: '您不可以修改自己的用户组',
      });
    }

    const targetClient = await Client.findOne({ id: data.id });
    if (!targetClient) {
      return res.status(404).json({
        message: '未找到目标用户',
      });
    }

    const targetCurrentRole = targetClient.role;
    const targetNewRole = data.newRole;
    const roleOptions = ['contributor', 'manager'];
    if (targetCurrentRole === 'admin' ||
      roleOptions.indexOf(targetCurrentRole) < 0 ||
      roleOptions.indexOf(targetNewRole) < 0) {
      return res.send(400, {
        message: '您不可以这样修改此用户组',
      });
    }

    if (targetCurrentRole === targetNewRole) {
      res.send(200, {
        message: '该用户已位于目标用户组中',
      });
    }
    try {
      await SQLService.update({
        where: { id: targetClient.id },
        model: 'client',
        data: { role: targetNewRole },
        client: req.session.clientId,
        action: 'updateClientRole',
      });

      res.send(200, {
        message: '成功更新用户组',
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  // update self info
  updateClient: async (req, res) => {
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
      await SQLService.update({
        action: 'updateClientDetail',
        model: 'client',
        client: req.session.clientId,
        data: changes,
        where: { id: client.id },
      });

      client = req.currentClient = await ClientService.findClient(client.id);

      res.status(201).json({
        message: '修改成功',
        client,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  verifyToken: async (req, res) => {
    const data = req.body;
    if (!data || !data.token) {
      return res.status(400).json({
        message: '缺少 token',
      });
    }

    const client = await Client.findOne({
      verificationToken: data.token,
    });

    if (!client) {
      return res.status(404).json({
        message: '该 token 无效',
      });
    }

    client.verificationToken = null;

    res.status(201).json({
      message: '账户验证成功',
    });
  },

  findClient: async (req, res) => {
    const name = req.param('clientName');
    const client = await ClientService.findClient(name);

    if (!client) {
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    // Should determine how much information to send based on client's group.
    return res.status(200).json({ client });
  },

  getClientList: async (req, res) => {
    let page = 1;
    let where = {};

    if (req.body && req.body.page) {
      page = req.body.page;
    } else if (req.query && req.query.page) {
      page = req.query.page;
    }

    if (req.body && req.body.where) {
      where = req.body.where;
    } else if (req.query && req.query.where) {
      where = req.query.where;
    }

    if (where) {
      try {
        where = JSON.parse(where);
      } catch (err) {/* happy */}
    }

    const fetchDetail = async (clients) => {
      const promises = [];
      for (const client of clients) {
        const fetch = async () => {
          client.subscriptionCount = await Subscription.count({ subscriber: client.id });
        };
        promises.push(fetch());
      }

      await Promise.all(promises);
    };

    const select = ['id', 'email', 'username', 'role'];
    let clients;
    if (where) {
      clients = await Client.find({
        where,
        select,
        sort: 'updatedAt DESC',
      })
        .populate('auths', {
          select: ['id', 'site', 'profileId', 'profile'],
          where: { profileId: { '>=': 1 } },
        });
    } else {
      clients = await Client.find({
        sort: 'updatedAt DESC',
        select,
      })
        .paginate({
          page,
          limit: 10,
        })
        .populate('auths', {
          select: ['id', 'site', 'profileId', 'profile'],
          where: { profileId: { '>=': 1 } },
        });
    }

    await fetchDetail(clients);

    res.status(200).json({ clientList: clients });
  },

  getClientDetail: async (req, res) => {
    const clientId = req.session.clientId;

    if (!clientId) {
      return res.status(401).json({
        message: '你还未登录',
      });
    }

    const client = await ClientService.findClient(clientId);
    if (!client) {
      delete req.session.clientId;
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    res.status(200).json({ client });
  },

};

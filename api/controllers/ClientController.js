/**
 * ClientController
 *
 * @description :: Server-side logic for managing clients
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const bcrypt = require('bcrypt');

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
        message: '错误的用户名/邮箱/密码',
      });
    }

    req.session.clientId = client.id;

    res.status(200).json({
      message: '登录成功',
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

    let client = await Client.findOne({ username: data.username });
    if (client) {
      return res.status(406).json({
        message: '该用户名/邮箱已被占用',
      });
    }

    try {
      salt = await bcrypt.genSalt(10);
    } catch (err) {
      return res.status(500).json({
        message: 'Error occurs when generateing salt',
      });
    }

    try {
      hash = await bcrypt.hash(data.password, salt);
    } catch (err) {
      return res.status(500).json({
        message: 'Error occurs when generateing hash',
      });
    }

    try {
      client = await Client.create({
        username: data.username,
        password: hash,
      });

      res.status(201).json({ message: '注册成功' });
    } catch (err) {
      return res.serverError(err);
    }

    client = { ...client };
    delete client.password;
    await Record.create({
      model: 'Client',
      target: client.id,
      data: client,
      operation: 'create',
      action: 'createClient',
      client: req.session.clientId, // Although in most cases it's null.
    });
  },

  role: async (req, res) => {
    const clientId = req.session.clientId;

    if (!clientId) {
      return res.status(401).json({
        message: '你还未登录',
      });
    }

    const client = await Client.findOne({ id: clientId });
    if (!client) {
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    const currentRole = client.role;

    if (req.method === 'GET') {
      return res.send(200, {
        role: currentRole,
      });
    } else if (req.method === 'POST') {
      const data = req.body;

      const roles = ['admin', 'manager', 'contributor'];

      if (typeof data.id !== 'number') {
        return res.status(500).json({
          message: 'id 参数错误',
        });
      }

      const targetClient = await Client.findOne({ id: data.id });
      if (!targetClient) {
        return res.status(404).json({
          message: '未找到目标用户',
        });
      }

      const targetRole = targetClient.role;

      if (roles.indexOf(currentRole) <= roles.indexOf(targetRole)
        && currentRole !== 'admin') {
        return res.send(500, {
          message: '您无权更改此用户权限',
        });
      }

      client.role = data.role;
      const err = await client.save();
      if (err) {
        return res.send(500, {
          message: '更新用户组失败',
        });
      } else {
        res.send(200, {
          message: '更新用户组成功',
        });

        const data = { ...client };
        delete data.password;

        await Record.create({
          model: 'Client',
          target: client.id,
          operation: 'update',
          action: 'updateClientRole',
          data,
          client: req.session.clientId,
        });
      }
    } else {
      return res.status(500).json({
        message: '不合法的方法',
      });
    }
  },

  getClientDetail: async (req, res) => {
    const clientId = req.session.clientId;

    if (!clientId) {
      return res.status(401).json({
        message: '你还未登录',
      });
    }

    const client = await Client.findOne({ id: clientId });
    if (!client) {
      delete req.session.clientId;
      return res.status(404).json({
        message: '未找到该用户',
      });
    }

    delete client.password;

    res.status(200).json(client);
  },

};

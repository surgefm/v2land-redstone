const bcrypt = require('bcryptjs');
const SeqModels = require('../../../seqModels');

async function changePassword (req, res) {
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

  try {
    await sequelize.transaction(async transaction => {
      const targetClient = await SeqModels.Client.findOne({
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

      targetClient.password = hash;
      await targetClient.save({ transaction });

      await SeqModels.Record.create({
        operation: 'update',
        model: 'Client',
        data: {
          password: hash,
        },
        action: 'updateClientPassword',
        client: targetId,
        target: targetId,
      }, { transaction });

      res.send(201, {
        message: '更新密码成功',
      });
    });
  } catch (err) {
    console.log(err);
    return res.serverError(err);
  }
}

module.exports = changePassword;

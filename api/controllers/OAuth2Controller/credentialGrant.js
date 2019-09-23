const { AuthorizationClient } = require('../../../seqModels');
const bcrypt = require('bcryptjs');

async function implicitGrant (req, res) {
  const data = req.query;

  const { authorizationClientId } = data;
  const authorizationClient = await AuthorizationClient.findOne({ where: { id: authorizationClientId } });
  if (authorizationClient == null) {
    return res.status(404).json({
      message: '未找到该客户端',
    });
  }
  if (!authorizationClient.allowAuthorizationByCredentials) {
    return res.status(403).json({
      message: '该客户端不支持通过密码授权',
    });
  }

  const client = await ClientService.findClient(data.username, {
    withAuths: false,
    withSubscriptions: false,
    withPassword: true,
  });

  const verified = await bcrypt.compare(data.password, client.password);
  if (!verified) {
    return res.status(401).json({
      message: '错误的用户名、邮箱或密码',
    });
  }

  const accessToken = await OAuth2Service.getNewAccessToken(client.id, authorizationClientId);
  return res.status(201).json({
    message: '操作成功',
    accessToken,
  });
}

module.exports = implicitGrant;

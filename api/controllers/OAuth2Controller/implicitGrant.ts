import { RedstoneRequest, RedstoneResponse } from '@Types';
import { AuthorizationClient } from '@Models';
import { OAuth2Service } from '@Services';
const isLoggedIn = require('../../policies/isLoggedIn');

async function implicitGrant (req: RedstoneRequest, res: RedstoneResponse) {
  await isLoggedIn(req, res, () => granting(req, res));
}

async function granting (req: RedstoneRequest, res: RedstoneResponse) {
  const authorizationClientId = req.query.authorizationClientId;
  const clientId = req.session.clientId;

  const authorizationClient = await AuthorizationClient.findOne({ where: { id: authorizationClientId } });
  if (authorizationClient == null) {
    return res.status(404).json({
      message: '未找到该客户端',
    });
  }

  const accessToken = await OAuth2Service.getNewAccessToken(clientId, authorizationClientId, true);
  return res.status(201).json({
    message: '操作成功',
    accessToken,
  });
}

export default implicitGrant;

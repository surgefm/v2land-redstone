import randomString from 'crypto-random-string';
import * as bcrypt from 'bcrypt';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { AuthorizationClient, AuthorizationAccessToken, Client } from '@Models';

async function findMcpClient(clientId: number): Promise<AuthorizationClient | null> {
  return AuthorizationClient.findOne({
    where: { owner: clientId, name: 'MCP' },
  });
}

export async function createMcpToken(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.session.clientId;
  const client = await Client.findByPk(clientId);
  if (!client) {
    return res.status(404).json({ message: '用户不存在' });
  }

  const plainSecret = randomString({ length: 64, type: 'url-safe' });
  const hashedSecret = await bcrypt.hash(plainSecret, 10);

  let authClient = await findMcpClient(clientId);

  if (authClient) {
    // Revoke existing access tokens
    await AuthorizationAccessToken.update(
      { status: 'revoked' },
      { where: { authorizationClientId: authClient.id, status: 'active' } },
    );
    // Update secret
    authClient.secret = hashedSecret;
    await authClient.save();
  } else {
    authClient = await AuthorizationClient.create({
      name: 'MCP',
      description: `MCP credentials for ${client.username}`,
      redirectURI: 'urn:ietf:wg:oauth:2.0:oob',
      allowAuthorizationByCredentials: false,
      secret: hashedSecret,
      owner: clientId,
    });
  }

  return res.status(201).json({
    message: 'MCP credentials 已生成',
    clientId: authClient.id,
    clientSecret: plainSecret,
  });
}

export async function getMcpTokenStatus(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.session.clientId;

  const authClient = await findMcpClient(clientId);
  if (!authClient || !authClient.secret) {
    return res.status(200).json({
      hasCredentials: false,
    });
  }

  return res.status(200).json({
    hasCredentials: true,
    clientId: authClient.id,
    createdAt: authClient.createdAt,
  });
}

export async function revokeMcpToken(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.session.clientId;

  const authClient = await findMcpClient(clientId);
  if (!authClient) {
    return res.status(200).json({ message: '无 MCP credentials' });
  }

  // Revoke all active access tokens
  const [revokedCount] = await AuthorizationAccessToken.update(
    { status: 'revoked' },
    { where: { authorizationClientId: authClient.id, status: 'active' } },
  );

  // Clear the secret
  authClient.secret = null as any;
  await authClient.save();

  return res.status(200).json({
    message: 'MCP credentials 已撤销',
    revokedCount,
  });
}

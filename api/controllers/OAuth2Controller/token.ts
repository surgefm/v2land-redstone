import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RedstoneRequest, RedstoneResponse } from '@Types';
import { AuthorizationClient, AuthorizationCode, AuthorizationAccessToken } from '@Models';
import { OAuth2Service } from '@Services';

async function token(req: RedstoneRequest, res: RedstoneResponse) {
  const grantType = req.body.grant_type;

  if (grantType === 'authorization_code') {
    return handleAuthorizationCode(req, res);
  } else if (grantType === 'client_credentials') {
    return handleClientCredentials(req, res);
  } else if (grantType === 'refresh_token') {
    return handleRefreshToken(req, res);
  }

  return res.status(400).json({ error: 'unsupported_grant_type' });
}

async function handleAuthorizationCode(req: RedstoneRequest, res: RedstoneResponse) {
  const { code, redirect_uri, client_id, code_verifier } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
  }

  const authCode = await AuthorizationCode.findOne({ where: { code } });
  if (!authCode || new Date(authCode.expire) < new Date()) {
    if (authCode) await authCode.destroy();
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code is invalid or expired' });
  }

  // Validate client_id
  if (String(authCode.authorizationClientId) !== String(client_id)) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'client_id mismatch' });
  }

  // Validate redirect_uri
  if (authCode.url !== (redirect_uri || '')) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'redirect_uri mismatch' });
  }

  // Validate PKCE
  if (authCode.codeChallenge) {
    if (!code_verifier) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'code_verifier is required' });
    }
    const expectedChallenge = createHash('sha256').update(code_verifier).digest('base64url');
    if (expectedChallenge !== authCode.codeChallenge) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
    }
  }

  // Issue access token (refreshable for auth code flow)
  const accessToken = await OAuth2Service.getNewAccessToken(
    authCode.owner,
    authCode.authorizationClientId,
    true,
  );

  // Delete the used authorization code
  await authCode.destroy();

  const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);

  return res.status(200).json({
    access_token: accessToken.token,
    token_type: 'bearer',
    expires_in: expiresIn,
    ...(accessToken.refreshToken ? { refresh_token: accessToken.refreshToken } : {}),
  });
}

async function handleClientCredentials(req: RedstoneRequest, res: RedstoneResponse) {
  const clientId = req.body.client_id;
  const clientSecret = req.body.client_secret;

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'client_id and client_secret are required' });
  }

  const authorizationClient = await AuthorizationClient.findByPk(clientId);
  if (!authorizationClient || !authorizationClient.secret || !authorizationClient.owner) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  const verified = await bcrypt.compare(clientSecret, authorizationClient.secret);
  if (!verified) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  const accessToken = await OAuth2Service.getNewAccessToken(
    authorizationClient.owner,
    authorizationClient.id,
    false,
  );

  const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);

  return res.status(200).json({
    access_token: accessToken.token,
    token_type: 'bearer',
    expires_in: expiresIn,
  });
}

async function handleRefreshToken(req: RedstoneRequest, res: RedstoneResponse) {
  const { refresh_token, client_id } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'invalid_request', error_description: 'refresh_token is required' });
  }

  const existingToken = await AuthorizationAccessToken.findOne({
    where: { refreshToken: refresh_token, status: 'active' },
  });

  if (!existingToken) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid refresh token' });
  }

  // Validate client_id if provided
  if (client_id && String(existingToken.authorizationClientId) !== String(client_id)) {
    return res.status(400).json({ error: 'invalid_grant', error_description: 'client_id mismatch' });
  }

  // Issue new access token
  const accessToken = await OAuth2Service.getNewAccessToken(
    existingToken.owner,
    existingToken.authorizationClientId,
    true,
  );

  const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);

  return res.status(200).json({
    access_token: accessToken.token,
    token_type: 'bearer',
    expires_in: expiresIn,
    ...(accessToken.refreshToken ? { refresh_token: accessToken.refreshToken } : {}),
  });
}

export default token;

import type { Express, Request, Response } from 'express';
import randomString from 'crypto-random-string';
import { AuthorizationClient, AuthorizationCode, Client } from '@Models';
import { RedstoneRequest } from '@Types';

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function mountOAuth(app: Express) {
  const serverUrl = process.env.API_URL || 'https://api.langchao.org';
  const frontendUrl = process.env.FRONTEND_URL || 'https://langchao.org';

  // OAuth2 Authorization Server Metadata (RFC 8414)
  app.get('/.well-known/oauth-authorization-server', (_req, res) => {
    res.json({
      issuer: serverUrl,
      authorization_endpoint: `${serverUrl}/oauth/authorize`,
      token_endpoint: `${serverUrl}/oauth2/token`,
      registration_endpoint: `${serverUrl}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token', 'client_credentials'],
      token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
      code_challenge_methods_supported: ['S256'],
    });
  });

  // OAuth2 Protected Resource Metadata (RFC 9728)
  app.get('/.well-known/oauth-protected-resource', (_req, res) => {
    res.json({
      resource: `${serverUrl}/mcp`,
      authorization_servers: [serverUrl],
      bearer_methods_supported: ['header'],
    });
  });

  // Dynamic Client Registration (RFC 7591)
  app.post('/oauth/register', async (req: Request, res: Response) => {
    const { redirect_uris, client_name, token_endpoint_auth_method, grant_types, response_types } = req.body;

    if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({
        error: 'invalid_client_metadata',
        error_description: 'redirect_uris is required',
      });
    }

    const authClient = await AuthorizationClient.create({
      name: client_name || 'MCP Client',
      description: 'Dynamically registered MCP client',
      redirectURI: redirect_uris[0],
      allowAuthorizationByCredentials: false,
    });

    return res.status(201).json({
      client_id: String(authClient.id),
      client_name: authClient.name,
      redirect_uris,
      token_endpoint_auth_method: token_endpoint_auth_method || 'none',
      grant_types: grant_types || ['authorization_code'],
      response_types: response_types || ['code'],
    });
  });

  // Authorization endpoint - GET
  // If user has an active session → show consent page
  // If not logged in → redirect to frontend login page
  app.get('/oauth/authorize', async (req: Request, res: Response) => {
    const { response_type, client_id } = req.query;

    if (response_type !== 'code') {
      return res.status(400).send('Unsupported response_type');
    }

    const authClient = await AuthorizationClient.findByPk(client_id as string);
    if (!authClient) {
      return res.status(400).send('Invalid client_id');
    }

    const clientId = (req as RedstoneRequest).session?.clientId;

    // Not logged in → redirect to frontend login, then back here
    if (!clientId) {
      const currentUrl = `${serverUrl}/oauth/authorize?${new URLSearchParams(req.query as Record<string, string>).toString()}`;
      const loginUrl = `${frontendUrl}/login?redirect=${encodeURIComponent(currentUrl)}`;
      return res.redirect(loginUrl);
    }

    // Logged in → show consent page
    const client = await Client.findByPk(clientId);
    const username = client ? (client as any).username || `User #${clientId}` : `User #${clientId}`;
    const clientName = escapeHtml(authClient.name || 'MCP Client');

    const hiddenFields = ['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource']
      .map(key => {
        const val = req.query[key] as string || '';
        return `<input type="hidden" name="${key}" value="${escapeHtml(val)}">`;
      })
      .join('\n      ');

    res.send(`<!DOCTYPE html>
<html lang="zh"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>授权 - 浪潮</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; border-radius: 12px; padding: 2rem; max-width: 400px; width: 90%; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .desc { color: #666; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .user { background: #f0f5ff; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .actions { display: flex; gap: 0.75rem; }
    .btn { flex: 1; padding: 0.7rem; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; }
    .btn-primary { background: #1890ff; color: white; }
    .btn-primary:hover { background: #40a9ff; }
    .btn-deny { background: #f0f0f0; color: #666; }
    .btn-deny:hover { background: #e0e0e0; }
  </style>
</head><body>
  <div class="card">
    <h1>授权访问</h1>
    <p class="desc"><strong>${clientName}</strong> 请求访问你的浪潮编辑室账户。</p>
    <div class="user">已登录为 <strong>${escapeHtml(username)}</strong></div>
    <form method="POST" action="/oauth/authorize">
      ${hiddenFields}
      <div class="actions">
        <button type="submit" name="action" value="approve" class="btn btn-primary">授权</button>
        <button type="submit" name="action" value="deny" class="btn btn-deny">拒绝</button>
      </div>
    </form>
  </div>
</body></html>`);
  });

  // Authorization endpoint - POST processes consent
  app.post('/oauth/authorize', async (req: Request, res: Response) => {
    const {
      client_id, redirect_uri, code_challenge, code_challenge_method, state, action,
    } = req.body;

    // If user denied
    if (action === 'deny') {
      if (redirect_uri) {
        const params = new URLSearchParams({ error: 'access_denied', error_description: 'User denied the request' });
        if (state) params.set('state', state);
        return res.redirect(`${redirect_uri}?${params.toString()}`);
      }
      return res.status(403).send('Access denied');
    }

    // Require session
    const clientId = (req as RedstoneRequest).session?.clientId;
    if (!clientId) {
      return res.status(401).send('Not authenticated');
    }

    // Validate client
    const authClient = await AuthorizationClient.findByPk(client_id);
    if (!authClient) {
      return res.status(400).send('Invalid client_id');
    }

    // Generate authorization code
    const code = randomString({ length: 64, type: 'url-safe' });
    await AuthorizationCode.create({
      code,
      expire: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      url: redirect_uri || '',
      owner: clientId,
      authorizationClientId: authClient.id,
      codeChallenge: code_challenge || null,
      codeChallengeMethod: code_challenge_method || null,
    });

    // Redirect back to client with code
    const params = new URLSearchParams({ code });
    if (state) params.set('state', state);
    return res.redirect(`${redirect_uri}?${params.toString()}`);
  });
}

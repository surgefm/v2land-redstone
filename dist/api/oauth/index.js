"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountOAuth = void 0;
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const _Models_1 = require("@Models");
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function mountOAuth(app) {
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
    app.post('/oauth/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const { redirect_uris, client_name, token_endpoint_auth_method, grant_types, response_types } = req.body;
        if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
            return res.status(400).json({
                error: 'invalid_client_metadata',
                error_description: 'redirect_uris is required',
            });
        }
        const authClient = yield _Models_1.AuthorizationClient.create({
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
    }));
    // Authorization endpoint - GET
    // If user has an active session → show consent page
    // If not logged in → redirect to frontend login page
    app.get('/oauth/authorize', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { response_type, client_id } = req.query;
        if (response_type !== 'code') {
            return res.status(400).send('Unsupported response_type');
        }
        const authClient = yield _Models_1.AuthorizationClient.findByPk(client_id);
        if (!authClient) {
            return res.status(400).send('Invalid client_id');
        }
        const clientId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.clientId;
        // Not logged in → redirect to frontend login, then back here
        if (!clientId) {
            const currentUrl = `${serverUrl}/oauth/authorize?${new URLSearchParams(req.query).toString()}`;
            const loginUrl = `${frontendUrl}/login?redirect=${encodeURIComponent(currentUrl)}`;
            return res.redirect(loginUrl);
        }
        // Logged in → show consent page
        const client = yield _Models_1.Client.findByPk(clientId);
        const username = client ? client.username || `User #${clientId}` : `User #${clientId}`;
        const clientName = escapeHtml(authClient.name || 'MCP Client');
        const hiddenFields = ['response_type', 'client_id', 'redirect_uri', 'code_challenge', 'code_challenge_method', 'state', 'scope', 'resource']
            .map(key => {
            const val = req.query[key] || '';
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
    }));
    // Authorization endpoint - POST processes consent
    app.post('/oauth/authorize', (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _b;
        const { client_id, redirect_uri, code_challenge, code_challenge_method, state, action, } = req.body;
        // If user denied
        if (action === 'deny') {
            if (redirect_uri) {
                const params = new URLSearchParams({ error: 'access_denied', error_description: 'User denied the request' });
                if (state)
                    params.set('state', state);
                return res.redirect(`${redirect_uri}?${params.toString()}`);
            }
            return res.status(403).send('Access denied');
        }
        // Require session
        const clientId = (_b = req.session) === null || _b === void 0 ? void 0 : _b.clientId;
        if (!clientId) {
            return res.status(401).send('Not authenticated');
        }
        // Validate client
        const authClient = yield _Models_1.AuthorizationClient.findByPk(client_id);
        if (!authClient) {
            return res.status(400).send('Invalid client_id');
        }
        // Generate authorization code
        const code = (0, crypto_random_string_1.default)({ length: 64, type: 'url-safe' });
        yield _Models_1.AuthorizationCode.create({
            code,
            expire: new Date(Date.now() + 10 * 60 * 1000),
            url: redirect_uri || '',
            owner: clientId,
            authorizationClientId: authClient.id,
            codeChallenge: code_challenge || null,
            codeChallengeMethod: code_challenge_method || null,
        });
        // Redirect back to client with code
        const params = new URLSearchParams({ code });
        if (state)
            params.set('state', state);
        return res.redirect(`${redirect_uri}?${params.toString()}`);
    }));
}
exports.mountOAuth = mountOAuth;

//# sourceMappingURL=index.js.map

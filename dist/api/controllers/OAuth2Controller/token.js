"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function token(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const grantType = req.body.grant_type;
        if (grantType === 'authorization_code') {
            return handleAuthorizationCode(req, res);
        }
        else if (grantType === 'client_credentials') {
            return handleClientCredentials(req, res);
        }
        else if (grantType === 'refresh_token') {
            return handleRefreshToken(req, res);
        }
        return res.status(400).json({ error: 'unsupported_grant_type' });
    });
}
function handleAuthorizationCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { code, redirect_uri, client_id, code_verifier } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'invalid_request', error_description: 'code is required' });
        }
        const authCode = yield _Models_1.AuthorizationCode.findOne({ where: { code } });
        if (!authCode || new Date(authCode.expire) < new Date()) {
            if (authCode)
                yield authCode.destroy();
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
            const expectedChallenge = (0, crypto_1.createHash)('sha256').update(code_verifier).digest('base64url');
            if (expectedChallenge !== authCode.codeChallenge) {
                return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
            }
        }
        // Issue access token (refreshable for auth code flow)
        const accessToken = yield _Services_1.OAuth2Service.getNewAccessToken(authCode.owner, authCode.authorizationClientId, true);
        // Delete the used authorization code
        yield authCode.destroy();
        const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);
        return res.status(200).json(Object.assign({ access_token: accessToken.token, token_type: 'bearer', expires_in: expiresIn }, (accessToken.refreshToken ? { refresh_token: accessToken.refreshToken } : {})));
    });
}
function handleClientCredentials(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.body.client_id;
        const clientSecret = req.body.client_secret;
        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: 'invalid_request', error_description: 'client_id and client_secret are required' });
        }
        const authorizationClient = yield _Models_1.AuthorizationClient.findByPk(clientId);
        if (!authorizationClient || !authorizationClient.secret || !authorizationClient.owner) {
            return res.status(401).json({ error: 'invalid_client' });
        }
        const verified = yield bcrypt.compare(clientSecret, authorizationClient.secret);
        if (!verified) {
            return res.status(401).json({ error: 'invalid_client' });
        }
        const accessToken = yield _Services_1.OAuth2Service.getNewAccessToken(authorizationClient.owner, authorizationClient.id, false);
        const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);
        return res.status(200).json({
            access_token: accessToken.token,
            token_type: 'bearer',
            expires_in: expiresIn,
        });
    });
}
function handleRefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { refresh_token, client_id } = req.body;
        if (!refresh_token) {
            return res.status(400).json({ error: 'invalid_request', error_description: 'refresh_token is required' });
        }
        const existingToken = yield _Models_1.AuthorizationAccessToken.findOne({
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
        const accessToken = yield _Services_1.OAuth2Service.getNewAccessToken(existingToken.owner, existingToken.authorizationClientId, true);
        const expiresIn = Math.floor((new Date(accessToken.expire).getTime() - Date.now()) / 1000);
        return res.status(200).json(Object.assign({ access_token: accessToken.token, token_type: 'bearer', expires_in: expiresIn }, (accessToken.refreshToken ? { refresh_token: accessToken.refreshToken } : {})));
    });
}
exports.default = token;

//# sourceMappingURL=token.js.map

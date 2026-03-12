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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeMcpToken = exports.getMcpTokenStatus = exports.createMcpToken = void 0;
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const bcrypt = __importStar(require("bcrypt"));
const _Models_1 = require("@Models");
function findMcpClient(clientId) {
    return __awaiter(this, void 0, void 0, function* () {
        return _Models_1.AuthorizationClient.findOne({
            where: { owner: clientId, name: 'MCP' },
        });
    });
}
function createMcpToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.session.clientId;
        const client = yield _Models_1.Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: '用户不存在' });
        }
        const plainSecret = (0, crypto_random_string_1.default)({ length: 64, type: 'url-safe' });
        const hashedSecret = yield bcrypt.hash(plainSecret, 10);
        let authClient = yield findMcpClient(clientId);
        if (authClient) {
            // Revoke existing access tokens
            yield _Models_1.AuthorizationAccessToken.update({ status: 'revoked' }, { where: { authorizationClientId: authClient.id, status: 'active' } });
            // Update secret
            authClient.secret = hashedSecret;
            yield authClient.save();
        }
        else {
            authClient = yield _Models_1.AuthorizationClient.create({
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
    });
}
exports.createMcpToken = createMcpToken;
function getMcpTokenStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.session.clientId;
        const authClient = yield findMcpClient(clientId);
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
    });
}
exports.getMcpTokenStatus = getMcpTokenStatus;
function revokeMcpToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientId = req.session.clientId;
        const authClient = yield findMcpClient(clientId);
        if (!authClient) {
            return res.status(200).json({ message: '无 MCP credentials' });
        }
        // Revoke all active access tokens
        const [revokedCount] = yield _Models_1.AuthorizationAccessToken.update({ status: 'revoked' }, { where: { authorizationClientId: authClient.id, status: 'active' } });
        // Clear the secret
        authClient.secret = null;
        yield authClient.save();
        return res.status(200).json({
            message: 'MCP credentials 已撤销',
            revokedCount,
        });
    });
}
exports.revokeMcpToken = revokeMcpToken;

//# sourceMappingURL=mcpToken.js.map

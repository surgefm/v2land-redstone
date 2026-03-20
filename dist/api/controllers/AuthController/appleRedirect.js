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
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable camelcase */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const apple_signin_auth_1 = __importDefault(require("apple-signin-auth"));
function appleRedirect(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { APPLE_CLIENT_ID } = process.env;
        if (!APPLE_CLIENT_ID) {
            return res.status(503).json({
                message: '暂不支持 Apple 登录',
            });
        }
        if (!(req.query && req.query.res)) {
            return res.status(400).json({
                message: '请求缺少 res',
            });
        }
        const r = JSON.parse(decodeURIComponent(req.query.res));
        const { authorization, user } = r;
        const { id_token } = authorization;
        const { name } = user || {};
        let id;
        let email;
        try {
            const { sub, email: e } = yield apple_signin_auth_1.default.verifyIdToken(id_token, {
                audience: APPLE_CLIENT_ID,
            });
            id = sub;
            email = e;
        }
        catch (err) {
            return res.status(403).json({
                message: '无法验证用户',
            });
        }
        const existingAuth = yield _Models_1.Auth.findOne({
            where: {
                profileId: `${id}`,
                site: 'apple',
            },
        });
        if (existingAuth) {
            existingAuth.profile = r;
            if (existingAuth.owner) {
                yield existingAuth.save();
                req.session.clientId = existingAuth.owner;
                return res.status(200).json(_Services_1.AuthService.sanitize(existingAuth));
            }
            else if (req.session.clientId) {
                existingAuth.owner = req.body.clientId;
                yield existingAuth.save();
                yield _Services_1.RecordService.create({
                    model: 'auth',
                    action: 'authorizeThirdPartyAccount',
                    owner: req.session.clientId,
                    target: existingAuth.id,
                });
                return res.status(201).json(_Services_1.AuthService.sanitize(existingAuth));
            }
        }
        const username = name ? user.firstName + name.lastName : id;
        const clientUsername = yield _Services_1.ClientService.randomlyGenerateUsername(username);
        let nickname = (name ? `${name.firstName} ${name.lastName}` : id).slice(0, 16).trim();
        if (nickname.length < 2) {
            nickname = id.slice(0, 16).trim();
        }
        const newClient = yield _Services_1.ClientService.createClient({
            username: clientUsername,
            nickname,
            inviteCode: req.query.inviteCode || '',
            email,
            emailVerified: true,
        });
        const auth = existingAuth || (yield _Models_1.Auth.create({
            site: 'apple',
            profileId: `${id}`,
            profile: r,
        }));
        auth.owner = newClient.id;
        yield auth.save();
        req.session.clientId = newClient.id;
        return res.status(201).json({
            message: '注册成功',
            auth: _Services_1.AuthService.sanitize(auth),
            client: newClient,
        });
    });
}
exports.default = appleRedirect;

//# sourceMappingURL=appleRedirect.js.map

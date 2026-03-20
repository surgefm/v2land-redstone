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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
const googleapis_1 = require("googleapis");
const _Models_1 = require("@Models");
const _Configs_1 = require("@Configs");
const _Services_1 = require("@Services");
const UploadService_1 = require("@Services/UploadService");
const generateRandomAlphabetString_1 = require("@Services/UtilService/generateRandomAlphabetString");
function googleRedirect(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.code && req.query.authId)) {
            return res.status(400).json({
                message: '请求缺少 code 或 authId',
            });
        }
        const oa = _Configs_1.oauth.google;
        const { code, authId } = req.query;
        const { tokens } = yield oa.getToken(code);
        const accessToken = tokens.access_token;
        const refreshToken = tokens.refresh_token;
        oa.setCredentials(tokens);
        const auth = yield _Models_1.Auth.findByPk(authId);
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        const response = yield new Promise((resolve, reject) => {
            googleapis_1.google.oauth2('v2').userinfo.get({
                auth: oa,
            }, (err, data) => (err ? reject(err) : resolve(data)));
        });
        const profile = response.data;
        auth.profileId = profile.id + '';
        const sameAuth = yield _Models_1.Auth.findOne({
            where: {
                site: 'google',
                profileId: profile.id + '',
            },
        });
        let account = sameAuth || auth;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        yield account.save();
        const sameEmailClient = yield _Models_1.Client.findOne({
            where: {
                email: profile.email,
            },
        });
        if (account.createdAt.toString() == account.updatedAt.toString() &&
            req.session.clientId) {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield account.update({
                    owner: req.session.clientId,
                    profile,
                }, { transaction });
                yield _Services_1.RecordService.create({
                    model: 'auth',
                    action: 'authorizeThirdPartyAccount',
                    owner: req.session.clientId,
                    target: account.id,
                }, { transaction });
            }));
            res.status(201).json(_Services_1.AuthService.sanitize(account));
        }
        else if (account.owner) {
            yield account.update({ profile });
            req.session.clientId = account.owner;
            res.status(200).json(_Services_1.AuthService.sanitize(account));
        }
        else if (sameEmailClient) {
            sameEmailClient.emailVerified = true;
            if (!sameEmailClient.avatar && UploadService_1.hasS3 && profile.picture) {
                const avatarUrl = profile.picture.replace('=s96-c', '=s512-c');
                sameEmailClient.avatar = yield (0, UploadService_1.uploadFromUrl)(avatarUrl, 'jpg');
            }
            account.owner = sameEmailClient.id;
            account.profile = profile;
            yield sameEmailClient.save();
            yield account.save();
            req.session.clientId = sameEmailClient.id;
            res.status(201).json(_Services_1.AuthService.sanitize(account));
        }
        else {
            let username;
            let gmailUsername = profile.email
                .split('@')[0]
                .split('')
                .filter(c => generateRandomAlphabetString_1.charset.includes(c))
                .join('');
            let exists = yield _Models_1.Client.findOne({ where: { username: gmailUsername } });
            if (!exists)
                username = gmailUsername;
            else {
                gmailUsername = profile.email.split('').filter(c => generateRandomAlphabetString_1.charset.includes(c)).join('');
                exists = yield _Models_1.Client.findOne({ where: { username: gmailUsername } });
                if (!exists) {
                    username = gmailUsername;
                }
                else {
                    username = yield _Services_1.ClientService.randomlyGenerateUsername();
                }
            }
            let nickname = profile.name
                .split('')
                .filter(c => c !== '@' && c !== '%')
                .slice(0, 16)
                .join('');
            let allDigit = true;
            for (const char of nickname) {
                if (!/\d/.test(char)) {
                    allDigit = false;
                    break;
                }
            }
            if (allDigit)
                nickname = 'Google_' + nickname;
            if (nickname.length < 2)
                nickname = 'Google user';
            nickname = nickname.slice(0, 16);
            let avatar;
            if (UploadService_1.hasS3 && profile.picture) {
                const avatarUrl = profile.picture.replace('=s96-c', '=s512-c');
                avatar = yield (0, UploadService_1.uploadFromUrl)(avatarUrl, 'jpg');
            }
            const newClient = yield _Services_1.ClientService.createClient({
                username,
                nickname,
                hashedPassword: '',
                avatar,
                email: profile.email,
                emailVerified: true,
                inviteCode: auth.inviteCode,
            });
            yield account.update({ profile, owner: newClient.id });
            account = _Services_1.AuthService.sanitize(account);
            req.session.clientId = newClient.id;
            return res.status(201).json({
                message: '注册成功',
                auth: account,
                client: newClient,
            });
        }
    });
}
exports.default = googleRedirect;

//# sourceMappingURL=googleRedirect.js.map

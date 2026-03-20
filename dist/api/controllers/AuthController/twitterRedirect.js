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
const _Models_1 = require("@Models");
const _Configs_1 = require("@Configs");
const _Services_1 = require("@Services");
const UploadService_1 = require("@Services/UploadService");
function twitterRedirect(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.token && req.query.verifier)) {
            return res.status(400).json({
                message: '请求缺少 token 或 verifier',
            });
        }
        const oa = _Configs_1.oauth.twitter;
        const { token, verifier } = req.query;
        const auth = yield _Models_1.Auth.findOne({ where: { token } });
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        const getAccessToken = () => {
            return new Promise((resolve) => {
                oa.getOAuthAccessToken(token, auth.tokenSecret, verifier, (err, accessToken, accessTokenSecret) => {
                    if (err) {
                        req.log.error(err);
                        return res.status(400).json({
                            message: '在验证绑定状况时发生了错误',
                        });
                    }
                    resolve({ accessToken, accessTokenSecret });
                });
            });
        };
        const { accessToken, accessTokenSecret } = yield getAccessToken();
        if (!accessToken || !accessTokenSecret)
            return;
        const getResponse = () => {
            return new Promise((resolve) => {
                oa.get('https://api.twitter.com/1.1/account/verify_credentials.json', accessToken, accessTokenSecret, (err, response) => {
                    if (err) {
                        req.log.error(err);
                        return res.status(400).json({
                            message: '在验证绑定状况时发生了错误',
                        });
                    }
                    resolve(response);
                });
            });
        };
        const responseStr = yield getResponse();
        if (!responseStr)
            return;
        const response = JSON.parse(responseStr);
        auth.profileId = response.id_str;
        const sameAuth = yield _Models_1.Auth.findOne({
            where: {
                site: 'twitter',
                profileId: response.id_str,
            },
        });
        let account = sameAuth || auth;
        account.accessToken = accessToken;
        account.accessTokenSecret = accessTokenSecret;
        yield account.save();
        if (!account.owner && req.session.clientId) {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield account.update({
                    owner: req.session.clientId,
                    profile: Object.assign({}, response),
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
        else if (account.owner && (!req.session.clientId ||
            (req.session.clientId === account.owner))) {
            yield account.update({
                profile: Object.assign({}, response),
            });
            req.session.clientId = account.owner;
            res.status(200).json(_Services_1.AuthService.sanitize(account));
        }
        else {
            const profile = Object.assign({}, response);
            let avatar;
            if (UploadService_1.hasS3 && profile.avatar_hd) {
                avatar = yield (0, UploadService_1.uploadFromUrl)(profile.profile_image_url, '.jpg');
            }
            const newClient = yield _Services_1.ClientService.createClient({
                username: yield _Services_1.ClientService.randomlyGenerateUsername(profile.screen_name),
                nickname: profile.name,
                description: profile.description,
                avatar,
                inviteCode: auth.inviteCode,
            });
            yield account.update({
                profile,
                owner: newClient.id,
            });
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
exports.default = twitterRedirect;

//# sourceMappingURL=twitterRedirect.js.map

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
const _Models_1 = require("@Models");
const _Configs_1 = require("@Configs");
const _Services_1 = require("@Services");
const UploadService_1 = require("@Services/UploadService");
const axios_1 = __importDefault(require("axios"));
function weiboRedirect(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.code && req.query.authId)) {
            return res.status(400).json({
                message: '请求缺少 code 或 authId',
            });
        }
        const oa = _Configs_1.oauth.weibo;
        const { code, authId } = req.query;
        const getAccessToken = () => {
            return new Promise((resolve) => {
                oa.getOAuthAccessToken(code, {
                    'redirect_uri': _Configs_1.globals.api + '/auth/weibo/callback',
                    'grant_type': 'authorization_code',
                }, (err, accessToken, refreshToken) => {
                    if (err) {
                        req.log.error(err);
                        return res.status(400).json({
                            message: '在验证绑定状况时发生了错误',
                        });
                    }
                    resolve({ accessToken, refreshToken });
                });
            });
        };
        const { accessToken, refreshToken } = yield getAccessToken();
        const auth = yield _Models_1.Auth.findByPk(authId);
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        const response = yield axios_1.default.post('https://api.weibo.com/oauth2/get_token_info?access_token=' + accessToken, { access_token: accessToken });
        auth.profileId = response.data.uid + '';
        const data = (yield axios_1.default.get('https://api.weibo.com/2/users/show.json?' +
            `uid=${response.data.uid}&access_token=${accessToken}`)).data;
        const sameAuth = yield _Models_1.Auth.findOne({
            where: {
                site: 'weibo',
                profileId: response.data.uid + '',
            },
        });
        let account = sameAuth || auth;
        account.accessToken = accessToken;
        account.refreshToken = refreshToken;
        yield account.save();
        if (!account.owner && req.session.clientId) {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield account.update({
                    owner: req.session.clientId,
                    profile: Object.assign({}, data),
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
            yield account.update({ profile: Object.assign({}, data) });
            req.session.clientId = account.owner;
            res.status(200).json(_Services_1.AuthService.sanitize(account));
        }
        else {
            const profile = Object.assign({}, data);
            let avatar;
            if (UploadService_1.hasS3 && profile.avatar_hd) {
                avatar = yield (0, UploadService_1.uploadFromUrl)(profile.avatar_hd, '.jpg');
            }
            const newClient = yield _Services_1.ClientService.createClient({
                username: yield _Services_1.ClientService.randomlyGenerateUsername(profile.domain),
                nickname: profile.screen_name,
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
exports.default = weiboRedirect;

//# sourceMappingURL=weiboRedirect.js.map

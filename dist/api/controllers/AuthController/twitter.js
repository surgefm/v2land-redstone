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
function twitter(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const oa = _Configs_1.oauth.twitter;
        if (!oa) {
            return res.status(503).json({
                message: '暂不支持 Twitter 绑定',
            });
        }
        const getToken = () => {
            return new Promise((resolve, reject) => {
                oa.getOAuthRequestToken((err, token, tokenSecret) => {
                    if (err)
                        return reject(err);
                    resolve({ token, tokenSecret });
                });
            });
        };
        try {
            const { token, tokenSecret } = yield getToken();
            yield _Models_1.Auth.create({
                site: 'twitter',
                token,
                tokenSecret,
                owner: req.session.clientId,
                redirect: req.query ? req.query.redirect : '',
                inviteCode: req.query ? req.query.inviteCode : '',
            });
            let redirect = 'https://twitter.com/oauth/authenticate?oauth_token=';
            redirect += token;
            res.redirect(307, redirect);
        }
        catch (e) {
            console.error(e);
            return res.status(503).json({
                message: 'Twitter 绑定错误，请与开发者联系',
            });
        }
    });
}
exports.default = twitter;

//# sourceMappingURL=twitter.js.map

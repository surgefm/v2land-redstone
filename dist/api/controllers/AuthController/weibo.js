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
/* eslint-disable @typescript-eslint/camelcase */
const _Models_1 = require("@Models");
const _Configs_1 = require("@Configs");
function weibo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const oa = _Configs_1.oauth.weibo;
        if (!oa) {
            return res.status(503).json({
                message: '暂不支持微博绑定',
            });
        }
        const auth = yield _Models_1.Auth.create({
            site: 'weibo',
            owner: req.session.clientId,
            redirect: req.query ? req.query.redirect : '',
            inviteCode: req.query ? req.query.inviteCode : '',
        });
        const callback = _Configs_1.globals.api + '/auth/weibo/callback';
        res.redirect(307, oa.getAuthorizeUrl({
            redirect_uri: callback,
            state: auth.id,
        }));
    });
}
exports.default = weibo;

//# sourceMappingURL=weibo.js.map

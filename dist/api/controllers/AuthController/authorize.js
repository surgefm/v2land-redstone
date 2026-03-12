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
/* eslint-disable @typescript-eslint/member-delimiter-style */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function authorize(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.body && req.body.authId)) {
            return res.status(400).json({
                message: '缺少参数：authId',
            });
        }
        const auth = yield _Models_1.Auth.findByPk(req.body.authId);
        if (!auth || !auth.profile) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        const { expireTime, owner } = auth.profile;
        if (!owner || owner !== req.sessionID) {
            return res.status(403).json({
                message: '你无权进行该绑定',
            });
        }
        else if (!expireTime || Date.now() > expireTime) {
            return res.status(403).json({
                message: '已过绑定时效，请重新发起绑定',
            });
        }
        try {
            yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                yield auth.update({
                    owner: req.body.clientId || req.session.clientId,
                }, { transaction });
                const data = {
                    id: auth.id,
                    site: auth.site,
                    profileId: auth.profileId,
                    owner: auth.owner,
                };
                yield _Services_1.RecordService.update({
                    model: 'Auth',
                    target: data.id,
                    data,
                    owner: req.session.clientId,
                    action: 'authorizeThirdPartyAccount',
                }, { transaction });
                res.status(201).json({
                    message: '绑定成功',
                });
            }));
        }
        catch (err) {
            return err;
        }
    });
}
exports.default = authorize;

//# sourceMappingURL=authorize.js.map

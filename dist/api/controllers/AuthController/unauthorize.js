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
const _Services_1 = require("@Services");
function unauthorize(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.params.authId) {
            return res.status(400).json({
                message: '缺少参数：authId',
            });
        }
        const auth = yield _Models_1.Auth.findByPk(req.params.authId);
        if (!auth) {
            return res.status(404).json({
                message: '未找到该绑定信息',
            });
        }
        if (auth.owner !== req.session.clientId) {
            return res.status(403).json({
                message: '你无权进行该解绑',
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            yield _Models_1.Auth.destroy({
                where: { id: auth.id },
                transaction,
            });
            yield _Services_1.RecordService.destroy({
                model: 'auth',
                target: auth.id,
                owner: req.session.clientId,
                action: 'unauthorizeThirdPartyAccount',
            }, { transaction });
        }));
        res.status(201).json({
            message: '成功解除绑定',
        });
    });
}
exports.default = unauthorize;

//# sourceMappingURL=unauthorize.js.map

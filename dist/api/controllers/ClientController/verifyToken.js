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
function verifyToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let token;
        let id;
        if (req.body && req.body.token && req.body.id) {
            token = req.body.token;
            id = req.body.id;
        }
        else if (req.query && req.query.token && req.query.id) {
            token = req.query.token;
            id = req.query.id;
        }
        if (!(token && id)) {
            return res.status(400).json({
                message: '缺少参数：token 或 id',
            });
        }
        const record = yield _Models_1.Record.findOne({
            where: {
                action: 'createClientVerificationToken',
                target: +id,
            },
            order: [['createdAt', 'DESC']],
        });
        if (!record) {
            return res.status(404).json({
                message: '未找到该 token',
            });
        }
        if (record.data.verificationToken !== token) {
            return res.status(404).json({
                message: '该 token 无效',
            });
        }
        if (new Date(record.data.expire).getTime() < Date.now()) {
            return res.status(404).json({
                message: '该 token 已失效',
            });
        }
        const client = yield _Models_1.Client.findByPk(record.data.clientId);
        if (!client) {
            return res.status(404).json({
                message: '该 token 无效',
            });
        }
        client.emailVerified = true;
        yield client.save();
        res.status(201).json({
            message: '账户验证成功',
        });
        _Services_1.ClientService.updateElasticsearchIndex({ client });
    });
}
exports.default = verifyToken;

//# sourceMappingURL=verifyToken.js.map

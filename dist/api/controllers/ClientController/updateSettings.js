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
function updateSettings(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body || !req.body.settings) {
            return res.status(400).json({
                message: '缺少修改信息',
            });
        }
        const { settings } = req.body;
        const name = req.params.clientName;
        yield _Services_1.ClientService.validateSettings(settings);
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const client = yield _Services_1.ClientService.findClient(name, {
                withAuths: false,
                withSubscriptions: false,
                transaction,
            });
            if (!client) {
                return res.status(404).json({
                    message: '未找到该用户',
                });
            }
            client.settings = Object.assign(Object.assign({}, client.settings), settings);
            yield client.save({ transaction });
            yield _Models_1.Record.create({
                operation: 'update',
                model: 'Client',
                data: { settings },
                client: req.session.clientId,
                target: req.session.clientId,
                action: 'updateClientSettings',
            }, { transaction });
            res.status(201).json({
                message: '成功更新用户设置',
            });
        }));
    });
}
exports.default = updateSettings;

//# sourceMappingURL=updateSettings.js.map

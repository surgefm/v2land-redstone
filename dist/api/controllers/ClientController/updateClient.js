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
function updateClient(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body) {
            return res.status(400).json({
                message: '缺少修改信息',
            });
        }
        const name = req.params.clientName;
        let client = yield _Services_1.ClientService.findClient(name, {
            withAuths: false,
            withSubscriptions: false,
        });
        if (!client) {
            return res.status(404).json({
                message: '未找到该用户',
            });
        }
        // if the client is not Admin, he is not allowed to update other client
        if (!req.currentClient.isAdmin && req.currentClient.username !== client.username) {
            return res.status(403).json({
                message: '您没有权限进行该操作',
            });
        }
        const changes = {};
        for (const i of ['nickname', 'avatar', 'description', 'username']) {
            if (req.body[i] && req.body[i] !== client[i]) {
                changes[i] = req.body[i];
            }
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const origClient = client.get({ plain: true });
            if (changes.username) {
                yield _Services_1.RedisService.del(_Services_1.RedisService.getClientIdKey(client.username));
            }
            yield client.update(changes, { transaction });
            yield _Services_1.RecordService.update({
                data: changes,
                owner: req.session.clientId,
                model: 'Client',
                before: origClient,
                target: client.id,
                action: 'updateClientDetail',
            }, { transaction });
        }));
        client = req.currentClient = yield _Services_1.ClientService.findClient(client.id);
        yield _Services_1.RedisService.set(_Services_1.RedisService.getClientIdKey(client.username), client.id);
        res.status(201).json({
            message: '修改成功',
            client,
        });
        _Services_1.ClientService.updateAlgoliaIndex({ clientId: client.id });
    });
}
exports.default = updateClient;

//# sourceMappingURL=updateClient.js.map

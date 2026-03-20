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
const _Services_1 = require("@Services");
const _Models_1 = require("@Models");
function updateClientPermission(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.body && !req.body.clientId && !req.body.resource && !req.body.action) {
            return res.status(400).json({
                message: '缺少参数 clientId 或 resource 或 action',
            });
        }
        const data = {
            clientId: parseInt(req.body.clientId),
            action: req.body.action,
            // should be like event-123
            resource: req.body.resource,
        };
        if (isNaN(data.clientId)) {
            return res.status(400).json({
                message: '参数 clientId 不是数字',
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const roleName = `${data.resource}-${data.action}-role`;
            if (req.method === 'DELETE') {
                yield _Services_1.AccessControlService.removeUserRoles(data.clientId, roleName, (err) => {
                    if (err) {
                        return res.status(404).json({
                            message: `用户 ${data.clientId}没有 "${data.action}" ${data.resource} 的权限，删除失败`,
                        });
                    }
                });
            }
            else if (req.method === 'POST') {
                yield _Services_1.AccessControlService.addUserRoles(data.clientId, roleName, (err) => {
                    if (err) {
                        return res.status(403).json({
                            message: `用户 ${data.clientId}已经拥有 "${data.action}" ${data.resource} 的权限`,
                        });
                    }
                });
            }
            const opWord = req.method === 'DELETE' ? 'delete' : 'update';
            yield _Models_1.Record.create({
                operation: opWord,
                model: 'acl',
                data: { role: roleName, action: data.action, resource: data.resource },
                client: req.session.clientId,
                target: data.clientId,
                action: 'updateClientPermission',
            }, { transaction });
            let message;
            if (req.method === 'POST') {
                message = `用户 ${data.clientId}现在拥有 "${data.action}" ${data.resource} 的权限，更新成功`;
            }
            else if (req.method === 'DELETE') {
                message = `用户 ${data.clientId}现在失去了 "${data.action}" ${data.resource} 的权限，删除成功`;
            }
            res.status(200).json({
                message: message,
            });
        }));
    });
}
exports.default = updateClientPermission;

//# sourceMappingURL=updateClientPermission.js.map

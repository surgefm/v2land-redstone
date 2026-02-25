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
function removeContact(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.id && req.query.unsubscribeId)) {
            return res.status(400).json({
                message: '缺少 id 或 unsubscribeId 参数',
            });
        }
        const contact = yield _Models_1.Contact.findOne({
            where: req.query,
        });
        if (!contact) {
            return res.status(404).json({
                message: '未找到该关注',
            });
        }
        if (contact.unsubscribeId !== req.query.unsubscribeId) {
            return res.status(400).json({
                message: '错误的解绑代码',
            });
        }
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            yield _Models_1.Contact.update({
                status: 'inactive',
            }, {
                where: { id: contact.id },
                transaction,
            });
            yield _Services_1.RecordService.update({
                model: 'Contact',
                action: 'removeSubscriptionContact',
                owner: req.session.clientId,
                target: contact.owner,
                data: { status: 'inactive' },
                before: { status: contact.status },
            }, { transaction });
        }));
        res.status(201).json({
            name: 'Remove successfully',
            message: '成功取消关注。',
        });
    });
}
exports.default = removeContact;

//# sourceMappingURL=removeContact.js.map

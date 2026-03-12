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
const sequelize_1 = require("sequelize");
function unsubscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.query && req.query.id && req.query.unsubscribeId)) {
            return res.status(400).json({
                message: '缺少 id 或 unsubscribeId 参数',
            });
        }
        const subscription = yield _Models_1.Subscription.findOne({
            where: req.query,
        });
        if (!subscription) {
            return res.status(404).json({
                message: '未找到该关注',
            });
        }
        let methods;
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            yield subscription.update({ status: 'unsubscribed' }, { transaction });
            yield _Services_1.RecordService.update({
                model: 'Subscription',
                action: 'cancelSubscription',
                owner: req.session.clientId,
                data: req.query.method ? methods : { status: 'unsubscribed' },
                before: subscription,
                target: subscription.id,
            }, { transaction });
        }));
        const otherSubscriptions = yield _Models_1.Subscription.findAll({
            where: {
                subscriber: subscription.subscriber,
                eventId: subscription.eventId,
                id: { [sequelize_1.Op.ne]: subscription.id },
            },
        });
        if (otherSubscriptions.length > 0) {
            res.status(201).json({
                name: 'More subscriptions to the same event',
                message: '成功取消关注。你对该事件还有其他关注，是否一并取消？',
                subscriptionList: otherSubscriptions,
            });
        }
        else {
            res.status(201).json({
                name: 'Unsubscribe successfully',
                message: '成功取消关注。',
            });
        }
    });
}
exports.default = unsubscribe;

//# sourceMappingURL=unsubscribe.js.map

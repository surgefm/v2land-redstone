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
const NotificationService_1 = require("@Services/NotificationService");
function pwaSubscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.body && req.body.subscriptionJSON)) {
            return res.status(400).json({
                message: '缺少参数 subscriptionJSON',
            });
        }
        const { subscriptionJSON } = req.body;
        const eventName = req.params.eventName;
        const event = yield _Services_1.EventService.findEvent(eventName, { eventOnly: true });
        if (!event) {
            return res.status(404).json({
                name: 'Event not found',
                message: '未找到该事件',
            });
        }
        if (event.status !== 'admitted') {
            return res.status(406).json({
                message: '该事件并不处于开放状态，无法进行关注',
            });
        }
        try {
            const subscription = JSON.parse(subscriptionJSON);
            yield NotificationService_1.webpush.sendNotification(subscription, JSON.stringify({
                message: '关注成功',
                purpose: 'new registration',
            }));
        }
        catch (err) {
            return res.status(401).json({
                message: '关注失败',
            });
        }
        yield _Services_1.RedisService.hset(_Services_1.RedisService.getSubscriptionCacheKey(event.id), subscriptionJSON, 'updates');
        return res.status(201).json({
            message: '关注成功',
        });
    });
}
exports.default = pwaSubscribe;

//# sourceMappingURL=pwaSubscribe.js.map

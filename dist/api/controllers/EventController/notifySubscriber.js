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
function notifySubscriber(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = req.params.eventName;
        const event = yield _Services_1.EventService.findEvent(name);
        const eventId = yield _Services_1.EventService.getEventId(name);
        const subscriptions = yield _Services_1.RedisService.hgetall(_Services_1.RedisService.getSubscriptionCacheKey(eventId));
        // eslint-disable-next-line guard-for-in
        yield Promise.all(Object.keys(subscriptions).map((key) => __awaiter(this, void 0, void 0, function* () {
            const subscription = JSON.parse(key);
            return NotificationService_1.webpush.sendNotification(subscription, JSON.stringify({
                eventId,
                title: event.name,
                message: (req.body || {}).message || '社区编辑给你发来了一条通知',
            }));
        })));
        return res.status(200).json({
            message: '通知成功',
        });
    });
}
exports.default = notifySubscriber;

//# sourceMappingURL=notifySubscriber.js.map

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 发出推送
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const sequelize_1 = require("sequelize");
const notifyByEmail_1 = __importDefault(require("./notifyByEmail"));
const notifyByEmailDailyReport_1 = __importDefault(require("./notifyByEmailDailyReport"));
const notifyByTwitter_1 = __importDefault(require("./notifyByTwitter"));
const notifyByTwitterAt_1 = __importDefault(require("./notifyByTwitterAt"));
const notifyByWeibo_1 = __importDefault(require("./notifyByWeibo"));
const notifyByWeiboAt_1 = __importDefault(require("./notifyByWeiboAt"));
const notifyByMobileAppNotification_1 = __importDefault(require("./notifyByMobileAppNotification"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
function notify(notification) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventId = notification.eventId;
        const event = notification.event || (yield _Models_1.Event.findByPk(eventId));
        const mode = _Services_1.ModeService.getMode(notification.mode);
        let news;
        let stack;
        if (mode.needNews) {
            const newsList = yield event.$get('news', {
                where: {
                    eventId: notification.eventId,
                    status: 'admitted',
                },
                order: [['time', 'DESC']],
            });
            if (newsList.length === 0)
                return;
            news = newsList[0];
        }
        if (mode.needStack) {
            stack = yield _Models_1.Stack.findOne({
                where: {
                    eventId: notification.eventId,
                    order: { [sequelize_1.Op.gte]: 0 },
                },
                order: [['order', 'DESC']],
            });
            if (!stack)
                return;
        }
        const template = yield mode.getTemplate({
            notification,
            event,
            news: news,
            stack: stack,
        });
        const notificationData = notification.get({ plain: true });
        notificationData.eventId = event.id;
        const subscriptions = yield _Models_1.Subscription.findAll({
            where: {
                mode: notification.mode,
                eventId: notification.eventId,
                status: 'active',
            },
        });
        const sendNotification = (subscription) => __awaiter(this, void 0, void 0, function* () {
            const data = {
                model: 'Subscription',
                target: subscription.id,
                action: 'notify',
            };
            const same = yield _Models_1.Record.count({
                where: Object.assign(Object.assign({}, data), { 'data.id': notificationData.id }),
            });
            if (same > 0) {
                // Already notified.
                return;
            }
            const queue = [];
            const contactList = yield _Models_1.Contact.findAll({
                where: {
                    subscriptionId: subscription.id,
                    status: 'active',
                },
                include: [{
                        model: _Models_1.Auth,
                        as: 'auth',
                        required: false,
                    }],
            });
            for (const contact of contactList) {
                if (!contact.auth && ['twitter', 'weibo', 'telegram'].includes(contact.type)) {
                    contact.auth = yield _Models_1.Auth.findOne({
                        where: {
                            site: contact.type,
                            profileId: contact.profileId,
                        },
                        order: [['updatedAt', 'DESC']],
                    });
                }
                const inputs = { contact, subscription, template, notification };
                switch (contact.method) {
                    case 'email':
                        queue.push((0, notifyByEmail_1.default)(inputs));
                        break;
                    case 'emailDailyReport':
                        queue.push((0, notifyByEmailDailyReport_1.default)(inputs));
                        break;
                    case 'twitter':
                        queue.push((0, notifyByTwitter_1.default)(inputs));
                        break;
                    case 'twitterAt':
                        queue.push((0, notifyByTwitterAt_1.default)(inputs));
                        break;
                    case 'weibo':
                        queue.push((0, notifyByWeibo_1.default)(inputs));
                        break;
                    case 'weiboAt':
                        queue.push((0, notifyByWeiboAt_1.default)(inputs));
                        break;
                    case 'mobileAppNotification':
                        queue.push((0, notifyByMobileAppNotification_1.default)(inputs));
                        break;
                }
            }
            yield Promise.all(queue);
        });
        const promises = subscriptions.map(s => sendNotification(s));
        try {
            yield Promise.all(promises);
        }
        catch (err) {
            logger.error(err);
        }
        const nextTime = yield mode.notified({
            notification,
            event,
            news: news,
            stack: stack,
        });
        yield _Models_1.Notification.update({
            status: 'complete',
        }, {
            where: { id: notification.id },
        });
        if (!['new', 'EveryNewStack'].includes(notification.mode)) {
            yield _Models_1.Notification.create({
                eventId: notification.eventId,
                mode: notification.mode,
                time: nextTime,
                status: 'pending',
            });
        }
    });
}
exports.default = notify;

//# sourceMappingURL=notify.js.map

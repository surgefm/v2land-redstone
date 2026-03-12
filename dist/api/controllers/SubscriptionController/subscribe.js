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
function subscribe(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(req.body && req.body.mode && req.body.contact)) {
            return res.status(400).json({
                message: '缺少参数 mode 或 contact',
            });
        }
        const { mode, contact } = req.body;
        let client;
        if (req.session.clientId) {
            client = yield _Models_1.Client.findOne({
                where: { id: req.session.clientId },
                include: [{
                        model: _Models_1.Auth,
                        required: false,
                        as: 'auths',
                    }],
            });
        }
        if (!_Services_1.ModeService.getMode(mode)) {
            return res.status(404).json({
                name: 'Subscribing mode not found',
                message: '未找到该关注模式',
            });
        }
        if (!['twitter', 'twitterAt', 'weibo', 'weiboAt', 'email', 'emailDailyReport', 'mobileAppNotification'].includes(contact.method)) {
            return res.status(400).json({
                name: 'Notification method not supported',
                message: '不支持的推送方式',
            });
        }
        let auth;
        const type = _Services_1.ContactService.getTypeFromMethod(contact.method);
        if (!['email', 'mobileApp'].includes(type)) {
            for (const item of client.auths) {
                if (item.id === contact[type] && item.site === type) {
                    auth = item;
                    break;
                }
            }
            if (typeof auth === 'undefined') {
                return res.status(400).json({
                    name: 'Corresponding third-party contact not found',
                    message: '未找到您在相关网络服务上的绑定。请于绑定后进行',
                });
            }
        }
        else {
            auth = { profileId: contact.profileId || client.email };
        }
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
        let subscription = yield _Models_1.Subscription.findOne({
            where: {
                subscriber: req.session.clientId,
                eventId: event.id,
                mode,
                status: 'active',
            },
        });
        if (subscription) {
            const oldContact = yield _Models_1.Contact.findOne({
                where: {
                    owner: req.session.clientId,
                    method: contact.method,
                    profileId: auth.profileId,
                    subscriptionId: subscription.id,
                    status: 'active',
                },
            });
            if (oldContact) {
                return res.status(200).json({
                    message: '已有相同关注',
                    subscription,
                });
            }
        }
        const beforeData = subscription
            ? subscription.get({ plain: true })
            : {};
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const action = subscription ? 'addContactToSubscription' : 'createSubscription';
            if (!subscription) {
                const notificationInDb = ['new', 'EveryNewStack'].includes(mode)
                    ? true
                    : yield _Models_1.Notification.findOne({
                        where: {
                            eventId: event.id,
                            mode,
                        },
                        transaction,
                    });
                if (!notificationInDb) {
                    const time = yield _Services_1.NotificationService.getNextTime(mode, event);
                    yield _Models_1.Notification.create({
                        eventId: event.id,
                        mode,
                        time,
                        status: 'pending',
                    }, { transaction });
                }
                const unsubscribeId = _Services_1.SubscriptionService.generateUnsubscribeId();
                subscription = yield _Models_1.Subscription.create({
                    subscriber: req.session.clientId,
                    eventId: event.id,
                    mode,
                    status: 'active',
                    unsubscribeId,
                }, { transaction });
            }
            yield _Models_1.Contact.create({
                subscriptionId: subscription.id,
                method: contact.method,
                profileId: auth.profileId,
                authId: auth.id,
                owner: req.session.clientId,
                type: _Services_1.ContactService.getTypeFromMethod(contact.method),
                unsubscribeId: _Services_1.SubscriptionService.generateUnsubscribeId(),
            }, { transaction });
            yield _Services_1.RecordService.create({
                model: 'Subscription',
                action,
                owner: req.session.clientId,
                data: subscription,
                target: subscription.id,
                before: beforeData,
            }, { transaction });
            subscription = yield _Models_1.Subscription.findOne({
                where: { id: subscription.id },
                include: [{
                        model: _Models_1.Contact,
                        required: false,
                        where: { status: 'active' },
                    }],
                transaction,
            });
            return res.status(201).json({
                message: '关注成功',
                subscription,
            });
        }));
    });
}
exports.default = subscribe;

//# sourceMappingURL=subscribe.js.map

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
 * Prepare data for notification reports.
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const sequelize_1 = require("sequelize");
const lodash_1 = __importDefault(require("lodash"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
function getReportData(report, { transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield report.$get('notifications', {
            where: { status: 'pending' },
            include: [_Models_1.Event],
            transaction,
        });
        const queue = notifications.map(n => getNotificationData(n));
        yield Promise.all(queue);
        const notificationGroups = lodash_1.default.groupBy(notifications, 'mode');
        const client = yield _Models_1.Client.findByPk(report.owner);
        const reportCount = yield _Models_1.Record.count({
            where: {
                action: _Services_1.ModeService.getRecordActionName(report),
                owner: report.owner,
            },
        });
        return {
            notifications,
            notificationGroups,
            date: getDate(),
            modeNames: _Services_1.ModeService.names,
            reportCount: reportCount + 1,
            client,
        };
    });
}
function getNotificationData(notification) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!notification.eventId)
            return;
        notification.stack = yield _Models_1.Stack.findOne({
            where: {
                eventId: notification.eventId,
                status: 'admitted',
                order: { [sequelize_1.Op.gte]: 0 },
            },
            order: [['order', 'DESC']],
            include: [{
                    model: _Models_1.News,
                    as: 'news',
                    where: { status: 'admitted' },
                    order: [['time', 'ASC']],
                    required: false,
                }],
        });
        if (notification.stack && notification.stack.news) {
            notification.news = notification.stack.news[0];
        }
        return notification;
    });
}
function getDate() {
    const date = (0, moment_timezone_1.default)(new Date).tz('Asia/Shanghai');
    const year = date.year();
    const month = date.month();
    const day = date.date();
    const str = `${year}.${month}.${day}`;
    return { year, month, day, str };
}
exports.default = getReportData;

//# sourceMappingURL=getReportData.js.map

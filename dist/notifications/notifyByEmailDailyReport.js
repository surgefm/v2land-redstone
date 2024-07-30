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
/**
 * 将通知添加到每日邮件简讯中
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
function notifyByEmailDailyReport({ subscription, notification }) {
    return __awaiter(this, void 0, void 0, function* () {
        const time = yield _Services_1.ModeService.getMode('daily').new();
        yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const reportData = {
                time: time.getTime(),
                status: 'pending',
                type: 'daily',
                owner: subscription.subscriber,
            };
            const report = (yield _Models_1.Report.findOrCreate({
                where: reportData,
                defaults: reportData,
                transaction,
            }))[0];
            const reportNotificationData = {
                status: 'pending',
                reportId: report.id,
                notificationId: notification.id,
            };
            yield _Models_1.ReportNotification.findOrCreate({
                where: reportNotificationData,
                defaults: reportNotificationData,
                transaction,
            });
        }));
    });
}
exports.default = notifyByEmailDailyReport;

//# sourceMappingURL=notifyByEmailDailyReport.js.map

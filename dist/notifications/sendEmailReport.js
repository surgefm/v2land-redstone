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
 * 正式发送邮件简讯（每日简讯/周报悉可）
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const getReportData_1 = __importDefault(require("./getReportData"));
function sendEmailReport(report, { transaction }) {
    return __awaiter(this, void 0, void 0, function* () {
        const reportData = yield (0, getReportData_1.default)(report, { transaction });
        const titles = {
            daily: '日报',
            weekly: '周报',
            monthly: '月报',
        };
        const email = {
            from: {
                name: '浪潮 V2Land',
                address: 'notify@langchao.org',
            },
            to: reportData.client.email,
            subject: `你的浪潮${titles[report.type] || '汇报'} - ${reportData.date.str}`,
            template: `email-report-${report.type}`,
            context: reportData,
        };
        yield _Services_1.EmailService.send(email);
        yield report.update({ status: 'complete' }, { transaction });
        yield _Models_1.ReportNotification.update({ status: 'complete' }, {
            where: {
                reportId: report.id,
                status: 'pending',
            },
            transaction,
        });
        return _Services_1.RecordService.create({
            model: 'Report',
            action: _Services_1.ModeService.getRecordActionName(report),
            owner: report.owner,
            target: report.id,
        }, { transaction });
    });
}
exports.default = sendEmailReport;

//# sourceMappingURL=sendEmailReport.js.map

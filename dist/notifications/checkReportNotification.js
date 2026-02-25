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
 * 检查有没有需要发出的汇总推送
 */
const _Models_1 = require("@Models");
const sequelize_1 = require("sequelize");
const sendReport_1 = __importDefault(require("./sendReport"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const checkInterval = 2000;
function checkReportNotification() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const report = yield _Models_1.Report.findOne({
                order: [['time', 'ASC']],
                where: {
                    status: 'pending',
                    time: { [sequelize_1.Op.lte]: Date.now() },
                },
            });
            if (!report) {
                setTimeout(checkReportNotification, checkInterval);
            }
            else {
                yield _Models_1.sequelize.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                    yield report.update({ status: 'ongoing' }, { transaction });
                    yield (0, sendReport_1.default)(report, { transaction });
                }));
                checkReportNotification();
            }
        }
        catch (err) {
            logger.error(err);
            setTimeout(checkReportNotification, checkInterval);
        }
    });
}
exports.default = checkReportNotification;

//# sourceMappingURL=checkReportNotification.js.map

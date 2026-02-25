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
exports.ThirtyDaysSinceLatestStackMode = void 0;
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const sequelize_1 = require("sequelize");
class ThirtyDaysSinceLatestStackMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = '30DaysSinceLatestStack';
        this.nickname = '三十天未更新进展';
        this.keepLatestOnly = true;
    }
    new({ event, stack }) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestStack = stack || (yield _Models_1.Stack.findOne({
                where: {
                    eventId: event.id,
                    status: 'admitted',
                    order: { [sequelize_1.Op.gte]: 0 },
                },
                order: [['order', 'DESC']],
            }));
            if (!latestStack) {
                return new Date('1/1/3000');
            }
            else {
                const date = (0, moment_timezone_1.default)(new Date()).tz('Asia/Shanghai');
                date.hour(20);
                date.minute(0);
                date.second(0);
                date.date(date.date() + 30);
                const d = date.toDate();
                return d.getTime() - Date.now() < 0 ? new Date('1/1/3000') : d;
            }
        });
    }
    notified() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/3000');
        });
    }
    getTemplate({ event }) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                subject: `${event.name} 已有七天没有消息`,
                message: `${event.name} 已有七天没有消息，快去看看有什么新的进展。`,
                button: '点击按钮查看事件',
                url: `${_Configs_1.globals.site}/${event.id}`,
            };
        });
    }
}
exports.ThirtyDaysSinceLatestStackMode = ThirtyDaysSinceLatestStackMode;
exports.default = new ThirtyDaysSinceLatestStackMode();

//# sourceMappingURL=ThirtyDaysSinceLatestStackMode.js.map

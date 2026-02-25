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
exports.DailyMode = void 0;
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
const errors_1 = require("@Utils/errors");
const sequelize_1 = require("sequelize");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class DailyMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = 'daily';
        this.nickname = '每日一次的定时提醒';
        this.needNews = false;
        this.isInterval = true;
    }
    new() {
        return __awaiter(this, void 0, void 0, function* () {
            const date = (0, moment_timezone_1.default)(new Date).tz('Asia/Shanghai');
            date.hour(20);
            date.minute(0);
            date.second(0);
            date.date(date.date() + 1);
            return date.toDate();
        });
    }
    notified() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.new();
        });
    }
    getTemplate({ notification, event, stack }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event) {
                if (!notification) {
                    throw new errors_1.MissingParameterError('notification');
                }
                event = notification.event;
            }
            if (typeof event === 'number') {
                event = yield _Models_1.Event.findOne({
                    where: { id: event },
                });
            }
            if (!stack) {
                stack = yield _Models_1.Stack.findOne({
                    where: {
                        eventId: event.id,
                        status: 'admitted',
                        order: { [sequelize_1.Op.gte]: 0 },
                    },
                    order: [['order', 'DESC']],
                });
            }
            let message = `${event.name} 发来了每日一次的定时提醒，`;
            message += stack
                ? `它的最新进展为 ${stack.title}。`
                : '该事件至今尚无进展。';
            return {
                subject: `${event.name} 发来了每日一次的定时提醒`,
                message,
                button: '点击按钮查看事件',
                url: `${_Configs_1.globals.site}/${event.id}`,
            };
        });
    }
}
exports.DailyMode = DailyMode;
exports.default = new DailyMode();

//# sourceMappingURL=DailyMode.js.map

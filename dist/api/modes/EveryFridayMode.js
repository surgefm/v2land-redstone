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
exports.EveryFridayMode = void 0;
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
const errors_1 = require("@Utils/errors");
const sequelize_1 = require("sequelize");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class EveryFridayMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = 'EveryFriday';
        this.nickname = '每周五定时提醒';
        this.needNews = false;
        this.isInterval = true;
    }
    new() {
        return __awaiter(this, void 0, void 0, function* () {
            const date = (0, moment_timezone_1.default)(new Date).tz('Asia/Shanghai');
            date.hour(20);
            date.minute(0);
            date.second(0);
            date.date(date.date() + 7 + (5 - date.day()));
            return date.toDate();
        });
    }
    notified() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.new();
        });
    }
    getTemplate({ notification, event, eventId, stack }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event && !eventId) {
                if (!notification) {
                    throw new errors_1.MissingParameterError('notification');
                }
                eventId = notification.eventId;
            }
            if (typeof eventId === 'number') {
                event = yield _Models_1.Event.findByPk(eventId);
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
            let message = `${event.name} 发来了每周五的定时提醒，`;
            message += stack
                ? `它的最新进展为 ${stack.title}。`
                : '该事件至今尚无进展。';
            return {
                subject: `${event.name} 发来了每周五的定时提醒`,
                message,
                button: '点击按钮查看事件',
                url: `${_Configs_1.globals.site}/${event.id}`,
            };
        });
    }
}
exports.EveryFridayMode = EveryFridayMode;
exports.default = new EveryFridayMode();

//# sourceMappingURL=EveryFridayMode.js.map

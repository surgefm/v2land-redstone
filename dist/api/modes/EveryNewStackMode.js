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
exports.EveryNewStackMode = void 0;
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
const errors_1 = require("@Utils/errors");
const sequelize_1 = require("sequelize");
class EveryNewStackMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = 'EveryNewStack';
        this.nickname = '新的事件进展';
        this.needStack = true;
    }
    new() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/2000');
        });
    }
    notified() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/3000');
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
            return {
                subject: `${event.name} 有了新的进展`,
                message: `${event.name} 最新进展：「${stack.title}」`,
                button: '点击按钮查看进展',
                url: `${_Configs_1.globals.site}/${event.id}/${stack.id}`,
            };
        });
    }
}
exports.EveryNewStackMode = EveryNewStackMode;
exports.default = new EveryNewStackMode();

//# sourceMappingURL=EveryNewStackMode.js.map

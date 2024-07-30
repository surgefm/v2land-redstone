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
exports.SevenDaysSinceLatestNewsMode = void 0;
const _Models_1 = require("@Models");
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class SevenDaysSinceLatestNewsMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = '7DaysSinceLatestNews';
        this.nickname = '七天未更新新闻';
        this.needNews = false;
        this.keepLatestOnly = true;
    }
    new({ event, news }) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestNews = news || (yield _Models_1.News.findOne({
                where: { status: 'admitted', eventId: event.id },
                order: [['time', 'DESC']],
            }));
            if (!latestNews) {
                return new Date('1/1/3000');
            }
            else {
                const date = (0, moment_timezone_1.default)(new Date()).tz('Asia/Shanghai');
                date.hour(8);
                date.minute(0);
                date.second(0);
                date.date(date.date() + 7);
                const d = date.toDate();
                return d.getTime() - Date.now() < 0 ? new Date('1/1/3000') : d;
            }
        });
    }
    update({ event, news }) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.new({ event, news });
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
exports.SevenDaysSinceLatestNewsMode = SevenDaysSinceLatestNewsMode;
exports.default = new SevenDaysSinceLatestNewsMode();

//# sourceMappingURL=SevenDaysSinceLatestNewsMode.js.map

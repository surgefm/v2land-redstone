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
exports.EveryNewNewsMode = void 0;
const _Types_1 = require("@Types");
const _Configs_1 = require("@Configs");
class EveryNewNewsMode extends _Types_1.NotificationMode {
    constructor() {
        super(...arguments);
        this.name = 'new';
        this.nickname = '新的新闻报道';
        this.needNews = true;
        this.isInterval = false;
    }
    new() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/3000');
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/2000');
        });
    }
    notified() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Date('1/1/3000');
        });
    }
    getTemplate({ event, news }) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                subject: `${event.name} 有了新的消息`,
                message: `${news.source} 发布了关于 ${event.name} 的新消息：「${news.abstract}」`,
                button: '点击按钮查看新闻',
                url: `${_Configs_1.globals.site}/${event.id}?news=${news.id}`,
            };
        });
    }
}
exports.EveryNewNewsMode = EveryNewNewsMode;
exports.default = new EveryNewNewsMode();

//# sourceMappingURL=EveryNewNewsMode.js.map

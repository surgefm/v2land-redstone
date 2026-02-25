"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const errors_1 = require("@Utils/errors");
const _Configs_1 = require("@Configs");
const _Models_1 = require("@Models");
const TelegramService = __importStar(require("../TelegramService"));
const SlackService = __importStar(require("../SlackService"));
const ClientService = __importStar(require("../ClientService"));
function notifyWhenNewsStatusChanged(oldNews, newNews, client) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!newNews) {
            throw new errors_1.MissingParameterError('newNews');
        }
        client = yield ClientService.findClient(client, { forceUpdate: false });
        if (!client) {
            throw new errors_1.MissingParameterError('client');
        }
        if (['pending', 'rejected'].includes(oldNews.status) &&
            newNews.status === 'admitted') {
            yield sendTelegramNotification(newNews, 'admitted', client);
        }
        else if (oldNews.status === 'admitted' &&
            newNews.status !== 'admitted') {
            yield sendTelegramNotification(newNews, 'rejected', client);
        }
    });
}
function sendTelegramNotification(news, status, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const newStatusStringSet = {
            'admitted': '审核通过了，进来看看吧！',
            'pending': '改为待审核状态，如有疑虑请咨询任一社区管理员。',
            'rejected': '拒绝了，如有疑虑请咨询任一社区管理员。',
            'hidden': '隐藏了，如有疑虑请咨询任一社区管理员。',
        };
        let stacks = news.stacks;
        if (!stacks) {
            stacks = yield news.$get('stacks', {
                attributes: ['id', 'title'],
            });
        }
        for (const stack of stacks) {
            const event = yield _Models_1.Event.findByPk(stack.eventId, { attributes: ['id', 'name'] });
            const submitRecord = yield _Models_1.Record.findOne({
                where: {
                    model: 'News',
                    action: 'createNews',
                    target: news.id,
                },
                include: [{
                        model: _Models_1.Client,
                        required: true,
                    }],
            });
            const username = (submitRecord && submitRecord.ownedBy.username)
                ? submitRecord.ownedBy.username
                : '游客';
            const sendSlack = () => __awaiter(this, void 0, void 0, function* () {
                const content = `*${username}* 添加的新闻` +
                    ` <${_Configs_1.globals.site}/${event.id}/${stack.id}/${news.id}|${event.name}> ` +
                    `被管理员 *${handler.username}* ${newStatusStringSet[status]}`;
                return SlackService.sendText(content);
            });
            const sendTelegram = () => __awaiter(this, void 0, void 0, function* () {
                const content = `*${username}*添加的新闻` +
                    `「[${event.name}](${_Configs_1.globals.site}/${event.id}/${stack.id}/${news.id}) 」` +
                    `被管理员*${handler.username}*${newStatusStringSet[status]}`;
                return TelegramService.sendText(content, 'Markdown');
            });
            yield Promise.all([
                sendSlack(),
                sendTelegram(),
            ]);
        }
    });
}
exports.default = notifyWhenNewsStatusChanged;

//# sourceMappingURL=notifyWhenNewsStatusChanged.js.map

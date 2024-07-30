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
const _Configs_1 = require("@Configs");
const _Models_1 = require("@Models");
const TelegramService = __importStar(require("../TelegramService"));
const SlackService = __importStar(require("../SlackService"));
const ClientService = __importStar(require("../ClientService"));
const AccessControlService = __importStar(require("../AccessControlService"));
function notifyWhenNewsCreated(news, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield ClientService.findClient(handler);
        const username = (client && client.username) || '游客';
        const isAdmin = yield AccessControlService.isClientAdmin(client.id);
        const stacks = news.stacks || (yield news.$get('stacks'));
        const promises = [];
        for (const stack of stacks) {
            const event = yield _Models_1.Event.findByPk(stack.eventId);
            promises.push(sendSlack(event, stack, news, username, isAdmin));
            promises.push(sendTelegram(event, stack, news, username, isAdmin));
        }
        return Promise.all(promises);
    });
}
function sendSlack(event, stack, news, username, isAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = `*${username}* 提交了新闻 *${news.title}* ` +
            `，请管理员尽快<${_Configs_1.globals.site}/${event.id}/admit|审核>`;
        if (isAdmin && news.status === 'admitted') {
            content = `管理员 *${username}* 提交了新闻` +
                ` <${_Configs_1.globals.site}/${event.id}/${stack.id}/${news.id})|${event.name}> ` +
                `，进来看看吧！`;
        }
        return SlackService.sendText(content);
    });
}
function sendTelegram(event, stack, news, username, isAdmin) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = `*${username}*提交了新闻*「${news.title}*」` +
            `，请管理员尽快[审核](${_Configs_1.globals.site}/${event.id}/admit)`;
        if (isAdmin && news.status === 'admitted') {
            content = `管理员*${username}*提交了新闻` +
                `「[${event.name}](${_Configs_1.globals.site}/${event.id}/${stack.id}/${news.id})」` +
                `，进来看看吧！`;
        }
        return TelegramService.sendText(content, 'Markdown', true);
    });
}
exports.default = notifyWhenNewsCreated;

//# sourceMappingURL=notifyWhenNewsCreated.js.map

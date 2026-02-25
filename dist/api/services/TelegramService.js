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
exports.sendText = exports.sendMessage = exports.TELE_TOKEN = void 0;
/* eslint-disable @typescript-eslint/camelcase */
const axios_1 = __importDefault(require("axios"));
const _Configs_1 = require("@Configs");
exports.TELE_TOKEN = process.env.TELE_TOKEN;
/**
 * reference: https://core.telegram.org/bots/api#sendmessage
 */
function sendMessage(chatId, text, parseMode = 'Markdown', disableWebPagePreview = false, disableNotification = false, replyToMessageId, replyMarkup, notifyMissingToken = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!exports.TELE_TOKEN && notifyMissingToken) {
            throw new Error('Environment Variable for TelegramService \'TELE_TOKEN\' undefined');
        }
        if (notifyMissingToken && (typeof chatId === 'undefined' ||
            typeof text === 'undefined')) {
            throw new TypeError(`params chatId of text is undefined`);
        }
        const data = {
            chat_id: chatId,
            text,
            parse_mode: parseMode,
            disable_web_page_preview: disableWebPagePreview,
            disable_notification: disableNotification,
            reply_to_message_id: replyToMessageId,
            reply_markup: replyMarkup,
        };
        try {
            const response = yield axios_1.default.post(`https://api.telegram.org/bot${exports.TELE_TOKEN}/sendMessage`, JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' },
            });
            return response;
        }
        catch (err) {
            console.error('Error sending telegram message', err);
        }
    });
}
exports.sendMessage = sendMessage;
function sendText(text, parseMode, disableWebPagePreview) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatId = _Configs_1.globals.telegramReviewChatId;
        if (_Configs_1.globals.environment !== 'production') {
            return;
        }
        return sendMessage(chatId, text, parseMode, disableWebPagePreview);
    });
}
exports.sendText = sendText;

//# sourceMappingURL=TelegramService.js.map

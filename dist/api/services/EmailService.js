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
exports.notify = exports.register = exports.send = void 0;
const _Configs_1 = require("@Configs");
const transporter = _Configs_1.email.transporter;
const qs_1 = __importDefault(require("qs"));
const delay_1 = __importDefault(require("delay"));
/**
 * wrapper for transporter.sendMail
 * @param {string} email
 */
function sendEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            transporter.sendMail(email, (err, message) => {
                if (err)
                    return reject(err);
                resolve(message);
            });
        });
    });
}
function send(email) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!transporter)
            return;
        if (transporter.isIdle()) {
            return sendEmail(email);
        }
        else {
            yield (0, delay_1.default)(500);
            return send(email);
        }
    });
}
exports.send = send;
function register(client, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = {
            to: client.email,
            from: {
                name: '浪潮 V2Land',
                address: 'verify@langchao.org',
            },
            template: 'registration',
            subject: client.username + '，请完成浪潮注册过程',
            context: {
                username: client.username,
                url: _Configs_1.globals.site + '/verify?' +
                    qs_1.default.stringify({
                        id: '' + client.id,
                        token,
                    }),
            },
        };
        return send(email);
    });
}
exports.register = register;
function notify(address, subscription, template) {
    return __awaiter(this, void 0, void 0, function* () {
        template.unsubscribe = `${_Configs_1.globals.api}/subscription/unsubscribe?` +
            `id=${subscription.id}` +
            `&unsubscribeId=${subscription.unsubscribeId}`;
        const email = {
            from: {
                name: '浪潮 V2Land',
                address: 'notify@langchao.org',
            },
            to: address,
            subject: template.subject,
            template: 'notification',
            context: template,
        };
        return send(email);
    });
}
exports.notify = notify;

//# sourceMappingURL=EmailService.js.map

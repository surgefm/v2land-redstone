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
const _Services_1 = require("@Services");
const disableSubscription_1 = __importDefault(require("./disableSubscription"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
function notifyByWeibo({ contact, subscription, template }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!contact) {
            yield (0, disableSubscription_1.default)(subscription);
            return logger.error(new Error(`未找到用户 ${subscription.subscriber} 的微博绑定`));
        }
        const message = _Services_1.UtilService.shortenString(template.message, 100)
            + ' ' + template.url;
        return _Services_1.WeiboService.post(contact.auth, message);
    });
}
exports.default = notifyByWeibo;

//# sourceMappingURL=notifyByWeibo.js.map

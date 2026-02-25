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
/**
 * 使用浪潮的绑定账号发布推文并 @ 用户
 */
const _Models_1 = require("@Models");
const _Services_1 = require("@Services");
const _Configs_1 = require("@Configs");
const disableSubscriptionMethod_1 = __importDefault(require("./disableSubscriptionMethod"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
function notifyByTwitterAt({ contact, subscription, template }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!_Configs_1.globals.officialAccount.twitter) {
            return logger.error(new Error('未配置官方 Twitter 账号'));
        }
        let profileId = _Configs_1.globals.officialAccount.twitter;
        profileId = typeof (profileId) === 'object'
            ? profileId[Math.floor(Math.random() * profileId.length)]
            : profileId;
        const auth = yield _Models_1.Auth.findOne({
            where: {
                site: 'twitter',
                profileId,
            },
        });
        if (!auth) {
            return logger.error(new Error(`未找到浪潮 Twitter ${profileId} 的绑定`));
        }
        if (!contact.auth)
            return (0, disableSubscriptionMethod_1.default)(subscription);
        let message = '@' + contact.auth.profile.screen_name + ' ';
        message += _Services_1.UtilService.shortenString(template.message, 100);
        message += ' ' + template.url + ' #浪潮';
        return _Services_1.TwitterService.tweet(auth, message);
    });
}
exports.default = notifyByTwitterAt;

//# sourceMappingURL=notifyByTwitterAt.js.map

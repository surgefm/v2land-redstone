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
exports.tweet = void 0;
const _Configs_1 = require("@Configs");
function tweet(auth, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const oa = _Configs_1.oauth.twitter;
            if (!oa) {
                reject(new Error('不支持发布推文：Twitter 未配置齐全'));
            }
            oa.post('https://api.twitter.com/1.1/statuses/update.json', auth.accessToken, auth.accessTokenSecret, { status }, 'status', err => {
                if (err)
                    return reject(err);
                resolve(null);
            });
        });
    });
}
exports.tweet = tweet;

//# sourceMappingURL=TwitterService.js.map

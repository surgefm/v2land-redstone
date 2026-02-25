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
exports.post = void 0;
const superagent_1 = __importDefault(require("superagent"));
const urlencode_1 = __importDefault(require("urlencode"));
function post(auth, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            superagent_1.default
                .post('https://api.weibo.com/2/statuses/share.json?' +
                'access_token=' + auth.accessToken +
                '&status=' + (0, urlencode_1.default)(status))
                .type('form')
                .end(err => {
                if (err)
                    return reject(err);
                resolve(null);
            });
        });
    });
}
exports.post = post;

//# sourceMappingURL=WeiboService.js.map

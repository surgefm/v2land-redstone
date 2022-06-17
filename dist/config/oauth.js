"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oauth_1 = require("oauth");
const googleapis_1 = require("googleapis");
const globals_1 = __importDefault(require("./globals"));
const env = process.env;
let twitter = null;
let weibo = null;
let google = null;
if (env.TWITTER_KEY && env.TWITTER_SECRET) {
    twitter = new oauth_1.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', env.TWITTER_KEY, env.TWITTER_SECRET, '1.0A', globals_1.default.api + '/auth/twitter/callback', 'HMAC-SHA1');
}
if (env.WEIBO_KEY && env.WEIBO_SECRET) {
    weibo = new oauth_1.OAuth2(env.WEIBO_KEY, env.WEIBO_SECRET, 'https://api.weibo.com/', 'oauth2/authorize', 'oauth2/access_token', null);
}
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_SECRET) {
    google = new googleapis_1.google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_SECRET, `${globals_1.default.api}/auth/google/callback`);
}
exports.default = {
    twitter,
    weibo,
    google,
};

//# sourceMappingURL=oauth.js.map

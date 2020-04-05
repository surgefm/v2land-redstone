import { OAuth, OAuth2 } from 'oauth';
import globals from './globals';

const env = process.env;
let twitter: OAuth = null;
let weibo: OAuth2 = null;

if (env.TWITTER_KEY && env.TWITTER_SECRET) {
  twitter = new OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    env.TWITTER_KEY,
    env.TWITTER_SECRET,
    '1.0A',
    globals.api + '/auth/twitter/callback',
    'HMAC-SHA1'
  );
}

if (env.WEIBO_KEY && env.WEIBO_SECRET) {
  weibo = new OAuth2(
    env.WEIBO_KEY,
    env.WEIBO_SECRET,
    'https://api.weibo.com/',
    'oauth2/authorize',
    'oauth2/access_token',
    null
  );
}

export default {
  twitter,
  weibo,
};

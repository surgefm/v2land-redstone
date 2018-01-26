const OAuth = require('oauth').OAuth;
const OAuth2 = require('oauth').OAuth2;
const globals = require('./globals').globals;

let env = process.env;
let twitter = (env.TWITTER_KEY && env.TWITTER_SECRET) ? {} : null;
let weibo = (env.WEIBO_KEY && env.WEIBO_SECRET) ? {} : null;

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

if (weibo) {
  weibo = new OAuth2(
    env.WEIBO_KEY,
    env.WEIBO_SECRET,
    'https://api.weibo.com/',
    'oauth2/authorize',
    'oauth2/access_token',
    null
  );
}

module.exports.oauth = {
  twitter,
  weibo,
};

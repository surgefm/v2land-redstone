module.exports = {

  sanitize(auth) {
    for (const property of ['token', 'tokenSecret',
      'accessToken', 'accessTokenSecret', 'refreshToken']) {
      delete auth[property];
    }

    return auth;
  },

  getSiteName(method) {
    switch (method) {
    case 'twitterAt':
      return 'twitter';
    case 'weiboAt':
      return 'weibo';
    default:
      return method;
    }
  },

};

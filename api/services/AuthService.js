module.exports = {

  sanitize(auth) {
    for (const property of ['token', 'tokenSecret',
      'accessToken', 'accessTokenSecret', 'refreshToken']) {
      delete auth[property];
    }

    return auth;
  },

};

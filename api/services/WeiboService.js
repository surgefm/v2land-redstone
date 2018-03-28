const request = require('superagent');
const urlencode = require('urlencode');

module.exports = {

  post: async (auth, status) => {
    return new Promise((resolve, reject) => {
      request
        .post('https://api.weibo.com/2/statuses/share.json?' +
          'access_token=' + auth.accessToken +
          '&status=' + urlencode(status)
        )
        .type('form')
        .end((err) => {
          if (err) return reject(err);
          resolve();
        });
    });
  },

};

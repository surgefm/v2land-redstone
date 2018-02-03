const request = require('superagent');
const urlencode = require('urlencode');

module.exports = {

  post: async (auth, status) => {
    const oa = sails.config.oauth.weibo;
    if (!oa) {
      throw new Error('不支持发布微博：微博未配置齐全');
    }

    request
      .post('https://api.weibo.com/2/statuses/share.json?' +
        'access_token=' + auth.accessToken +
        '&status=' + urlencode(status)
      )
      .type('form')
      .end((err) => {
        if (err) throw err;
        return;
      });
  },

};

module.exports = {

  tweet: async (auth, status) => {
    return new Promise((resolve, reject) => {
      const oa = sails.config.oauth.twitter;
      if (!oa) {
        reject(new Error('不支持发布推文：Twitter 未配置齐全'));
      }

      oa.post('https://api.twitter.com/1.1/statuses/update.json',
        auth.accessToken, auth.accessTokenSecret, { status }, (err) => {
          if (err) reject(err);
          resolve();
        });
    });
  },

};
